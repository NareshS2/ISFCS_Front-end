import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService, Survey, AnswerRequestDTO, ResponseRequestDTO } from '../../../../core/services/survey.service';

@Component({
  selector: 'app-survey-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './survey-detail.component.html',
  styleUrls: ['./survey-detail.component.css']
})
export class SurveyDetailComponent implements OnInit {
  survey: Survey | null = null;
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  answers: Map<number, string> = new Map();

  constructor(
    private surveyService: SurveyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSurvey();
  }

  loadSurvey(): void {
    this.isLoading = true;
    const surveyId = this.route.snapshot.params['id'];
    console.log('Loading survey with ID:', surveyId, 'Type:', typeof surveyId);

    this.surveyService.getSurveyById(surveyId).subscribe({
      next: (survey: Survey) => {
        console.log('Survey loaded successfully:', survey);
        console.log('Survey structure:', {
          surveyId: survey.surveyId,
          title: survey.title,
          questions: survey.questions,
          firstQuestion: survey.questions?.[0]
        });
        this.survey = survey;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading survey:', err);
        console.error('Full error object:', JSON.stringify(err));
        this.error = 'Failed to load survey: ' + (err?.error?.message || err?.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  // Update answer for a question
  updateAnswer(questionId: number, value: string): void {
    this.answers.set(questionId, value);
  }

  // Get answer for a question
  getAnswer(questionId: number): string {
    return this.answers.get(questionId) || '';
  }

  // Check if all required fields are answered
  areAllQuestionsAnswered(): boolean {
    if (!this.survey) return false;
    return this.survey.questions.every(q => this.answers.has(q.questionId) && this.answers.get(q.questionId)?.trim());
  }

  // Submit survey response
  submitSurvey(): void {
    if (!this.survey || !this.areAllQuestionsAnswered()) {
      this.error = 'Please answer all questions before submitting';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // Build answer array from the map
    const answerArray: AnswerRequestDTO[] = Array.from(this.answers.entries()).map(([questionId, value]) => ({
      questionId,
      value
    }));

    const request: ResponseRequestDTO = {
      answers: answerArray,
      isAnonymous: this.survey.isAnonymous
    };

    this.surveyService.submitSurveyResponse(this.survey.surveyId, request).subscribe({
      next: () => {
        this.isSubmitting = false;
        // Navigate back to employee dashboard
        this.router.navigate(['/dashboard/employee']);
      },
      error: (err) => {
        console.error('Error submitting survey:', err);
        this.error = 'Failed to submit survey. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Check if deadline is passed
  isDeadlinePassed(): boolean {
    if (!this.survey) return false;
    return new Date(this.survey.endDate) < new Date();
  }

  // Go back to dashboard
  goBack(): void {
    this.router.navigate(['/dashboard/employee']);
  }
}
