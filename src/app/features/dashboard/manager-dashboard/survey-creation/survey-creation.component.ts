import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManagerSurveyService, SurveyRequestDTO } from '../../../../core/services/manager-survey.service';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-survey-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './survey-creation.component.html',
  styleUrls: ['./survey-creation.component.css']
})
export class SurveyCreateComponent {
  survey: SurveyRequestDTO = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isAnonymous: false,
    questions: []
  };

  isSubmitting = false;
  error = '';

  constructor(
    private surveyService: ManagerSurveyService,
    private router: Router
  ) {}

  addQuestion(type: 'MCQ' | 'TEXT' | 'RATING') {
    const baseQuestion: any = {
      type: type, // Critical for backend @JsonTypeInfo
      text: '',
    };

    if (type === 'MCQ') {
      baseQuestion.options = [{ text: '' }, { text: '' }];
    } else if (type === 'RATING') {
      baseQuestion.minRating = 1;
      baseQuestion.maxRating = 5;
    }

    this.survey.questions.push(baseQuestion);
  }

  removeQuestion(index: number) {
    this.survey.questions.splice(index, 1);
  }

  addOption(questionIndex: number) {
    this.survey.questions[questionIndex].options.push({ text: '' });
  }

  removeOption(qIndex: number, oIndex: number) {
    this.survey.questions[qIndex].options.splice(oIndex, 1);
  }

  /**
   * Orchestrates the two-step survey process:
   * 1. POST /api/surveys (Creates in DRAFT)
   * 2. PATCH /api/surveys/{id}/submit (Moves to PENDING_APPROVAL)
   */
  createSurvey() {
    this.isSubmitting = true;
    this.error = '';

    const payload = { ...this.survey };
    
    this.surveyService.createSurvey(payload).pipe(
      switchMap((createResponse: any) => {
        // Extract ID from SuccessResponse (adjust based on your actual API data envelope)
        const surveyId = createResponse.data?.surveyId || createResponse.data?.id;
        
        if (!surveyId) {
          return throwError(() => new Error('Survey ID missing from creation response.'));
        }

        return this.surveyService.submitSurvey(surveyId);
      }),
      catchError((err) => {
        this.isSubmitting = false;
        // Handles errors from either the first or second call
        this.error = err.error?.message || err.message || 'An error occurred during survey submission';
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        alert('Survey created and submitted for Admin approval!');
        this.router.navigate(['/dashboard/manager']);
      },
      error: (err) => {
        console.error('Submission chain failed:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/manager']);
  }
}