import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SurveyService, Survey, AnswerRequestDTO, ResponseRequestDTO, Option } from '../../../../core/services/survey.service';

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
    private router: Router,
    private cdr: ChangeDetectorRef // Required to force UI refresh
  ) {}

  ngOnInit(): void {
    this.loadSurvey();
  }

  loadSurvey(): void {
    this.isLoading = true;
    const surveyId = Number(this.route.snapshot.params['id']);

    this.surveyService.getSurveyById(surveyId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          // This forces Angular to acknowledge the survey data and hide the loader
          this.cdr.detectChanges(); 
        })
      )
      .subscribe({
        next: (surveyData: Survey) => {
          this.survey = surveyData;
          console.log('Survey data assigned to component:', this.survey);
        },
        error: (err) => {
          console.error('Error loading survey:', err);
          this.error = 'Failed to load survey: ' + (err?.error?.message || err?.message);
        }
      });
  }

updateAnswer(questionId: number, value: any): void {
  // Force the value to a string as expected by the Backend DTO
  this.answers.set(questionId, value.toString());
  
  // CRITICAL: Manually tell Angular to check the button [disabled] status again
  this.cdr.detectChanges(); 
}

  getAnswer(questionId: number): string {
    return this.answers.get(questionId) || '';
  }

// Update this function in your component
areAllQuestionsAnswered(): boolean {
  if (!this.survey || !this.survey.questions) return false;
  
  // Every question must have an entry in the map that isn't just whitespace
  return this.survey.questions.every(q => {
    const answer = this.answers.get(q.questionId);
    return answer !== undefined && answer !== null && answer.toString().trim() !== '';
  });
}
submitSurvey(): void {
  if (!this.survey || !this.areAllQuestionsAnswered()) {
    this.error = 'Please answer all questions before submitting';
    return;
  }

  this.isSubmitting = true;
  this.error = null;

  // Map the answers from the Map to the Array format expected by the DTO
  const answerArray: AnswerRequestDTO[] = Array.from(this.answers.entries()).map(([qId, val]) => ({
    questionId: qId,
    value: val
  }));

  // Match the Spring Boot ResponseRequestDTO exactly
  const request: ResponseRequestDTO = {
    answers: answerArray,
    // Note: Use 'anonymous' from your survey data if that's how it's named in the console
    isAnonymous: (this.survey as any).anonymous || this.survey.isAnonymous || false
  };

  this.surveyService.submitSurveyResponse(this.survey.surveyId, request)
    .pipe(finalize(() => {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (res) => {
        console.log('Submission successful:', res);
        // Navigate back or show success state
        this.router.navigate(['/dashboard/employee']);
      },
      error: (err) => {
        console.error('Submission error:', err);
        this.error = err.error?.message || 'Failed to submit response. Please try again.';
      }
    });
}

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  isDeadlinePassed(): boolean {
    if (!this.survey) return false;
    return new Date(this.survey.endDate) < new Date();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/employee']);
  }
}