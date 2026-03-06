import { Component, signal, inject, computed } from '@angular/core'; // Added inject and computed
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Added router for navigation
import { SurveyService } from '../../services/survey.service'; // Import your shared service
import { NotificationService } from '../../services/notification.service'; // Import the notification service

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule],
  templateUrl: './employee-dashboard.component.html',
})
export class EmployeeDashboardComponent {
  // Inject services
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  private notifService = inject(NotificationService);

  // Link to service signals
  notifications = this.notifService.allNotifications;
  unreadCount = this.notifService.unreadCount;

  // UI State
  showNotifDropdown = signal(false);

  toggleNotifications() {
    this.showNotifDropdown.update(v => !v);
  }

  markAllRead() {
    this.notifService.markAllAsRead();
  }

  // User data remains local to this component
  user = signal({
    name: 'John Employee',
    department: 'Engineering',
    role: 'Employee',
    email: 'john.e@surveytrack.com'
  });

  // UI State for Modal
  isProfileOpen = signal(false);
  
  // Password Form State
  passwordData = signal({
    current: '',
    new: '',
    confirm: ''
  });

  toggleProfile() {
    this.isProfileOpen.update(v => !v);
  }

  updatePassword() {
    const data = this.passwordData();
    if (data.new !== data.confirm) {
      alert("New passwords do not match!");
      return;
    }
    if (data.new.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    // Simulate API Call
    console.log("Updating password...", data);
    alert("Password updated successfully!");
    
    // Reset and Close
    this.passwordData.set({ current: '', new: '', confirm: '' });
    this.isProfileOpen.set(false);
  }

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