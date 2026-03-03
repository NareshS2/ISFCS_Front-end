import { Component, signal, inject, computed } from '@angular/core'; // Added inject and computed
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Added router for navigation
import { SurveyService } from '../../services/survey.service'; // Import your shared service

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-dashboard.component.html',
})
export class EmployeeDashboardComponent {
  // Inject services
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  // User data remains local to this component
  user = signal({
    name: 'John',
    fullName: 'John Employee',
    role: 'employee',
    department: 'Engineering'
  });

  /** * We now use 'computed' to automatically filter the list from the Service.
   * Whenever the Service updates (like when a manager creates a survey),
   * these lists will update here automatically.
   */

  // Surveys that are NOT completed
  pendingSurveys = computed(() =>
    this.surveyService.surveys().filter(s => !s.completed)
  );

  // Surveys that ARE completed
  completedSurveys = computed(() =>
    this.surveyService.surveys().filter(s => s.completed)
  );

  // Navigation method for the "Start Survey" button
  startSurvey(id: number) {
    this.router.navigate(['/survey', id]);
  }
}