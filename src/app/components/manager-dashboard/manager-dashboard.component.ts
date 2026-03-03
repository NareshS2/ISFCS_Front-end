import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../services/survey.service';
import { Router } from '@angular/router'; // Add this import

@Component({
  selector: 'app-manager-dashboard', // Updated selector
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-dashboard.component.html'     // Updated path
})
export class ManagerDashboardComponent { // Renamed class
  private surveyService = inject(SurveyService);
  private router = inject(Router);
  manager = signal({
    name: 'Sarah Manager',
    role: 'manager'
  });

  stats = signal([
    { label: 'Total Surveys', value: '2', subtext: '2 active', icon: '📋' },
    { label: 'Total Responses', value: '1', subtext: 'across all surveys', icon: '👥' },
    { label: 'Avg Response Rate', value: '1%', subtext: 'participation rate', icon: '📈' },
    { label: 'Active Surveys', value: '2', subtext: 'collecting responses', icon: '📊' }
  ]);
  // Add this method to handle navigation to the creation page
  goToCreate() {
    this.router.navigate(['/create-survey']);
  }
  allSurveys = this.surveyService.surveys;
}

// this.router.navigate(['/create-survey'])