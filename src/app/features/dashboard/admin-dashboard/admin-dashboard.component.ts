import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminService, User, Survey } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Admin info
  adminName: string = '';
  adminDepartment: string = '';

  // Toggle state
  activeTab: 'surveys' | 'users' = 'surveys';

  // Surveys
  activeSurveys: Survey[] = [];
  pendingSurveys: Survey[] = [];
  completedSurveys: Survey[] = [];
  filteredApprovedSurveys: Survey[] = [];
  filteredPendingSurveys: Survey[] = [];
  filteredCompletedSurveys: Survey[] = [];
  surveysSearchQuery: string = '';

  // Users
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  usersSearchQuery: string = '';

  // UI State
  isLoading: boolean = false;
  error: string = '';
  showAddUserModal: boolean = false;
  showSurveyDetailModal: boolean = false;
  selectedSurvey: Survey | null = null;

  // Notifications
  notificationCount: number = 0;
  showNotificationPanel: boolean = false;
  notifications: any[] = [];

  // Profile menu
  showProfileMenu: boolean = false;

  newUser = {
  name: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  department: ''
};

  departments = ['IT', 'HR', 'FINANCE', 'MARKETING', 'OPERATIONS', 'SALES', 'ENGINEERING', 'ADMINISTRATION'];
  roles = ['EMPLOYEE', 'MANAGER', 'ADMIN'];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAdminDashboard();
    // Set default admin name from localStorage if available
    const userEmail = localStorage.getItem('userEmail');
    this.adminName = userEmail?.split('@')[0] || 'Admin';
  }

  loadAdminDashboard(): void {
    this.isLoading = true;
    this.error = '';
    this.loadSurveys();
    this.loadUsers();
  }

  loadSurveys(): void {
    this.isLoading = true;
    
    // Use forkJoin to fetch both sets of surveys at once
    forkJoin({
      active: this.adminService.getActiveSurveys(0, 100),
      pending: this.adminService.getPendingApprovalSurveys(0, 100)
    }).subscribe({
      next: (result) => {
        const now = new Date();

        // 1. Process Active Surveys & Check Deadlines
        const activeFromApi = result.active || [];
        this.activeSurveys = activeFromApi.filter(s => {
        const endDate = new Date(s.endDate);
        return s.status === 'ACTIVE' && endDate > now;
      });

      // 2. Identify Completed/Expired Surveys
      const expiredSurveys = activeFromApi.filter(s => {
        const endDate = new Date(s.endDate);
        return s.status === 'CLOSED' || (s.status === 'ACTIVE' && endDate <= now);
      });
      
      this.completedSurveys = [...expiredSurveys];

      // 3. Process Pending Surveys
      this.pendingSurveys = result.pending || [];

      // Update UI lists
      this.refreshFilteredLists();
      this.isLoading = false;
    },
    error: (err) => {
      this.error = 'Failed to load surveys';
      this.isLoading = false;
    }
  });
}

// Helper to keep code clean
refreshFilteredLists(): void {
  this.filteredApprovedSurveys = [...this.activeSurveys];
  this.filteredPendingSurveys = [...this.pendingSurveys];
  this.filteredCompletedSurveys = [...this.completedSurveys];
  this.searchSurveys(); 
}



  loadUsers(): void {
    this.adminService.getAllUsers(0, 100).subscribe({
      next: (users: User[]) => {
        // Filter only active users
        this.allUsers = users.filter((u: User) => u.status === 'ACTIVE');
        this.filteredUsers = [...this.allUsers];
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Failed to load users';
      }
    });
  }

  switchTab(tab: 'surveys' | 'users'): void {
    this.activeTab = tab;
    this.surveysSearchQuery = '';
    this.usersSearchQuery = '';
  }

  // ============== SURVEY SEARCH ==============
  searchSurveys(): void {
    const query = this.surveysSearchQuery.toLowerCase();

    if (!query) {
      this.filteredApprovedSurveys = [...this.activeSurveys];
      this.filteredPendingSurveys = [...this.pendingSurveys];
      this.filteredCompletedSurveys = [...this.completedSurveys];
    } else {
      this.filteredApprovedSurveys = this.activeSurveys.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.createdBy.name.toLowerCase().includes(query)
      );
      this.filteredPendingSurveys = this.pendingSurveys.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.createdBy.name.toLowerCase().includes(query)
      );
      this.filteredCompletedSurveys = this.completedSurveys.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.createdBy.name.toLowerCase().includes(query)
      );
    }
  }

  // ============== USER SEARCH ==============
  searchUsers(): void {
    const query = this.usersSearchQuery.toLowerCase();

    if (!query) {
      this.filteredUsers = [...this.allUsers];
    } else {
      this.filteredUsers = this.allUsers.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.department.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
      );
    }
  }

  // ============== SURVEY MODALS ==============
  openSurveyDetail(survey: Survey): void {
    this.selectedSurvey = survey;
    this.showSurveyDetailModal = true;
  }

  closeSurveyDetail(): void {
    this.showSurveyDetailModal = false;
    this.selectedSurvey = null;
  }

  approveSurvey(survey: Survey): void {
    this.adminService.publishSurvey(survey.surveyId).subscribe({
      next: () => {
        // Update survey status
        survey.status = 'ACTIVE';
        // Remove from pending, add to approved
        this.pendingSurveys = this.pendingSurveys.filter(s => s.surveyId !== survey.surveyId);
        this.activeSurveys.push(survey);
        this.searchSurveys(); // Refresh filtered lists
        this.closeSurveyDetail();
      },
      error: (err) => {
        console.error('Error approving survey:', err);
        this.error = 'Failed to approve survey';
      }
    });
  }

  rejectSurvey(survey: Survey): void {
    const reason = prompt('Please enter reason for rejection:');
    if (reason) {
      this.adminService.rejectSurvey(survey.surveyId, reason).subscribe({
        next: () => {
          survey.status = 'REJECTED';
          this.pendingSurveys = this.pendingSurveys.filter(s => s.surveyId !== survey.surveyId);
          this.completedSurveys.push(survey);
          this.searchSurveys(); // Refresh filtered lists
          this.closeSurveyDetail();
        },
        error: (err) => {
          console.error('Error rejecting survey:', err);
          this.error = 'Failed to reject survey';
        }
      });
    }
  }

  deleteSurvey(survey: Survey): void {
    if (confirm(`Are you sure you want to delete "${survey.title}"?`)) {
      this.adminService.deleteSurvey(survey.surveyId).subscribe({
        next: () => {
          this.activeSurveys = this.activeSurveys.filter(s => s.surveyId !== survey.surveyId);
          this.pendingSurveys = this.pendingSurveys.filter(s => s.surveyId !== survey.surveyId);
          this.completedSurveys = this.completedSurveys.filter(s => s.surveyId !== survey.surveyId);
          this.searchSurveys(); // Refresh filtered lists
          this.closeSurveyDetail();
        },
        error: (err) => {
          console.error('Error deleting survey:', err);
          this.error = 'Failed to delete survey';
        }
      });
    }
  }

  // ============== USER MODALS ==============
  openAddUserModal(): void {
    this.showAddUserModal = true;
  }

  // Add this method to handle submission
addUser(): void {
  if (!this.newUser.name || !this.newUser.email || !this.newUser.password || !this.newUser.department) {
    alert('Please fill in all required fields');
    return;
  }

  this.isLoading = true;
  this.adminService.createUser(this.newUser).subscribe({
    next: (response) => {
      alert('User registered successfully');
      this.closeAddUserModal();
      this.loadUsers(); // Refresh the list to show the new user
      this.resetUserForm();
      this.isLoading = false;
    },
    error: (err) => {
      this.error = err.error?.message || 'Failed to create user';
      this.isLoading = false;
    }
  });
}

resetUserForm(): void {
  this.newUser = {
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    department: ''
  };
}

  closeAddUserModal(): void {
    this.showAddUserModal = false;
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
    return this.adminName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getSurveyStatusClass(survey: Survey): string {
    if (survey.status === 'ACTIVE') return 'status-active';
    if (survey.status === 'PENDING_APPROVAL') return 'status-pending';
    if (survey.status === 'CLOSED') return 'status-closed';
    if (survey.status === 'REJECTED') return 'status-rejected';
    return 'status-draft';
  }

  getRoleColor(role: string): string {
    switch(role) {
      case 'ADMIN': return '#ef4444';
      case 'MANAGER': return '#8b5cf6';
      case 'EMPLOYEE': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  }
}
