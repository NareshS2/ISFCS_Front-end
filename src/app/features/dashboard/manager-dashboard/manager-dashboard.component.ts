import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerSurveyService, Survey, SurveyStats } from '../../../core/services/manager-survey.service';
import { ParticipationService } from '../../../core/services/participation.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {
  // Manager info
  managerName: string = '';
  managerDepartment: string = '';

  // Surveys
  surveys: Survey[] = [];
  filteredSurveys: Survey[] = [];
  searchQuery: string = '';

  // Statistics
  surveyStats: SurveyStats = {
    totalSurveys: 0,
    totalResponses: 0,
    averageResponseRate: 0,
    activeSurveys: 0
  };

  // UI State
  isLoading: boolean = false;
  error: string = '';
  showCreateModal: boolean = false;
  showSurveyDetailModal: boolean = false;
  selectedSurvey: Survey | null = null;

  // Notifications
  notificationCount: number = 0;
  showNotificationPanel: boolean = false;
  notifications: any[] = [];

  // Profile menu
  showProfileMenu: boolean = false;

  constructor(
    private surveyService: ManagerSurveyService,
    private participationService: ParticipationService
  ) {}

  ngOnInit(): void {
    this.loadManagerDashboard();
  }

  loadManagerDashboard(): void {
    this.isLoading = true;
    this.error = '';

    // Load manager profile
    this.participationService.getEmployeeProfile().subscribe({
      next: (profile) => {
        this.managerName = profile.employeeName || 'Manager';
        this.managerDepartment = profile.department || 'Department';
      },
      error: (err) => {
        console.error('Error loading manager profile:', err);
        this.managerName = 'Manager';
      }
    });

    // Load manager's surveys
    this.loadSurveys();

    // Load manager's survey statistics
    this.surveyService.getManagerSurveyStats().subscribe({
      next: (stats) => {
        this.surveyStats = stats;
      },
      error: (err) => {
        console.error('Error loading survey stats:', err);
      }
    });

    this.isLoading = false;
  }

  loadSurveys(): void {
    this.surveyService.getManagerSurveys(0, 50).subscribe({
      next: (response) => {
        this.surveys = response.data || response.content || response;
        this.filteredSurveys = this.surveys;
      },
      error: (err) => {
        console.error('Error loading surveys:', err);
        this.error = 'Failed to load surveys';
      }
    });
  }

  searchSurveys(): void {
    if (!this.searchQuery.trim()) {
      this.filteredSurveys = this.surveys;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredSurveys = this.surveys.filter(survey =>
      survey.title.toLowerCase().includes(query) ||
      survey.description.toLowerCase().includes(query)
    );
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  openSurveyDetail(survey: Survey): void {
    this.selectedSurvey = survey;
    this.showSurveyDetailModal = true;
  }

  closeSurveyDetail(): void {
    this.showSurveyDetailModal = false;
    this.selectedSurvey = null;
  }

  toggleNotifications(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
    if (this.showNotificationPanel) {
      this.showProfileMenu = false;
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showNotificationPanel = false;
    }
  }

  getInitials(): string {
    return this.managerName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getSurveyStatusClass(survey: Survey): string {
    if (survey.status === 'ACTIVE') return 'status-active';
    if (survey.status === 'CLOSED') return 'status-closed';
    return 'status-draft';
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('email');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  }
}
