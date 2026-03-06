import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { SurveyService, Survey } from '../../../core/services/survey.service';
import { ParticipationService, ParticipationStats } from '../../../core/services/participation.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  employeeName = '';
  employeeDepartment = '';
  employeeInitials = '';
  
  // Surveys
  activeSurveys: Survey[] = [];
  completedSurveys: Survey[] = [];
  filteredActiveSurveys: Survey[] = [];
  filteredCompletedSurveys: Survey[] = [];
  searchQuery = '';
  
  // Notifications
  notifications: Notification[] = [];
  notificationCount = 0;
  
  // Stats
  participationStats: ParticipationStats = {
    pendingSurveys: 0,
    completedSurveys: 0,
    completionRate: 0
  };
  
  // UI State
  showNotificationPanel = false;
  showProfileMenu = false;
  isLoadingData = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private surveyService: SurveyService,
    private participationService: ParticipationService
  ) {}

  ngOnInit(): void {
    this.loadEmployeeData();
  }

  loadEmployeeData(): void {
    this.isLoadingData = true;

    // Load profile information
    this.participationService.getEmployeeProfile().subscribe({
      next: (response: any) => {
        const userData = response.data || response;
        this.employeeName = userData.name || userData.employeeName || '';
        this.employeeDepartment = userData.department || '';
        this.employeeInitials = this.getInitials(this.employeeName);
        this.loadSurveys();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoadingData = false;
      }
    });

    // Load notifications
    this.loadNotifications();
  }

  loadSurveys(): void {
    this.surveyService.getActiveSurveys(0, 100).subscribe({
      next: (surveys: Survey[]) => {
        // All returned surveys are ACTIVE (pending for employee)
        this.activeSurveys = surveys;
        this.filteredActiveSurveys = surveys;
        
        // TODO: Fetch completed surveys from a separate endpoint when available
        this.completedSurveys = [];
        this.filteredCompletedSurveys = [];
        
        this.updateStats();
        this.isLoadingData = false;
      },
      error: (error) => {
        console.error('Error loading surveys:', error);
        this.isLoadingData = false;
      }
    });
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications: Notification[]) => {
        this.notifications = notifications;
        this.notificationCount = notifications.length;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  updateStats(): void {
    const pendingCount = this.activeSurveys.length;
    const completedCount = this.completedSurveys.length;
    const totalSurveys = pendingCount + completedCount;

    this.participationStats = {
      pendingSurveys: pendingCount,
      completedSurveys: completedCount,
      completionRate: totalSurveys > 0 ? (completedCount / totalSurveys) * 100 : 0
    };
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  toggleNotifications(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
    this.showProfileMenu = false;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotificationPanel = false;
  }

  closeAllMenus(): void {
    this.showNotificationPanel = false;
    this.showProfileMenu = false;
  }

  searchSurveys(): void {
    const query = this.searchQuery.toLowerCase();
    
    if (!query.trim()) {
      this.filteredActiveSurveys = [...this.activeSurveys];
      this.filteredCompletedSurveys = [...this.completedSurveys];
    } else {
      this.filteredActiveSurveys = this.activeSurveys.filter(survey =>
        survey.title.toLowerCase().includes(query) ||
        survey.description?.toLowerCase().includes(query)
      );
      this.filteredCompletedSurveys = this.completedSurveys.filter(survey =>
        survey.title.toLowerCase().includes(query) ||
        survey.description?.toLowerCase().includes(query)
      );
    }
  }

  // Navigate to survey detail page for submission
  openSurvey(surveyId: number): void {
    this.router.navigate(['/dashboard/employee/survey', surveyId]);
  }

  // Mark notification as read and remove from list
  markNotificationAsRead(notification: Notification): void {
    const notifId = notification.id || notification.notificationId || 0;
    this.notificationService.markAsRead(notifId).subscribe({
      next: () => {
        // Remove notification from list
        this.notifications = this.notifications.filter(n => 
          (n.id || n.notificationId) !== notifId
        );
        this.notificationCount = this.notifications.length;
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  changePassword(): void {
    alert('Change password feature coming soon');
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error during logout:', error);
        this.router.navigate(['/login']);
      }
    });
  }
}
