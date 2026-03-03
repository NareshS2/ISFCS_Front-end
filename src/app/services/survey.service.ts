import { Injectable, signal } from '@angular/core';

export interface Survey {
  id: number;
  title: string;
  category: string;
  description: string;
  daysLeft?: number;
  questionsCount: number;
  completed: boolean;
  completedDaysAgo?: number;
}

@Injectable({ providedIn: 'root' })
export class SurveyService {
  // A master signal list of all surveys
  private surveysList = signal<Survey[]>([
    {
      id: 1,
      title: 'Q1 2026 Employee Engagement Survey',
      category: 'Engagement',
      description: 'Help us understand your experience and improve our workplace culture.',
      daysLeft: 7,
      questionsCount: 4,
      completed: false
    },
    {
      id: 101,
      title: 'Remote Work Feedback',
      category: 'Workplace',
      description: 'Feedback on home office setup.',
      questionsCount: 5,
      completed: true,
      completedDaysAgo: 2
    }
  ]);

  // Read-only signals for the components
  surveys = this.surveysList.asReadonly();

  completeSurvey(id: number) {
    this.surveysList.update(all => all.map(s => 
      s.id === id ? { ...s, completed: true, completedDaysAgo: 0 } : s
    ));
  }

  addSurvey(newSurveyData: any) {
  const survey: Survey = {
    id: Math.floor(Math.random() * 1000), // Generate a random ID
    title: newSurveyData.title,
    category: newSurveyData.category,
    description: newSurveyData.description,
    daysLeft: 14, // Default for new surveys
    questionsCount: newSurveyData.questions.length,
    completed: false
  };

  this.surveysList.update(all => [survey, ...all]);
}

}
