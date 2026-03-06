import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService } from '../../services/survey.service';
import { Router } from '@angular/router'; // Add this import
import { NotificationService } from '../../services/notification.service'; // Import the notification service

@Component({
  selector: 'app-manager-dashboard', // Updated selector
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './manager-dashboard.component.html'     // Updated path
})
export class ManagerDashboardComponent { // Renamed class

  private surveyService = inject(SurveyService);
  private router = inject(Router);
  private notifService = inject(NotificationService); // Inject the notification service

  currentUser = signal({
    name: 'Sarah',
    role: 'Manager', // or 'Employee'
    email: 'sarah.manager@surveytrack.com',
    dept: 'Engineering'
  }); 


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

  manager = signal({
    name: 'Sarah Manager',
    role: 'manager'
  });

  newSurvey = {
    title: '',
    category: 'Engineering',
    description: '',
    questionsCount: 0
  };

  // In ManagerDashboardComponent
  saveSurvey() {
    this.surveyService.addSurvey(this.newSurvey);
    // Trigger the notification
    this.notifService.addNotification(`New survey "${this.newSurvey.title}" created by Manager`, 'survey');

    // 3. Reset the form
    this.newSurvey = { title: '', category: 'Engineering', description: '', questionsCount: 0 };

    alert('Survey submitted for Admin approval!');
  }

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