import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-create-survey',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-survey.component.html'
})
export class CreateSurveyComponent {
  private fb = inject(FormBuilder);
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  surveyForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    category: ['Engagement'],
    deadline: ['', Validators.required],
    publishNow: [false],
    questions: this.fb.array([]) // Dynamic array for questions
  });

  constructor() {
    this.addQuestion(); // Start with one question by default
  }

  get questions() {
    return this.surveyForm.get('questions') as FormArray;
  }

  addQuestion() {
    const questionGroup = this.fb.group({
      text: ['', Validators.required],
      type: ['Text Response'],
      required: [true]
    });
    this.questions.push(questionGroup);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  onCreateSurvey() {
    if (this.surveyForm.valid) {
      this.surveyService.addSurvey(this.surveyForm.value);
      this.router.navigate(['/manager-dashboard']);
    }
  }

  onCancel() {
    this.router.navigate(['/manager-dashboard']);
  }
}