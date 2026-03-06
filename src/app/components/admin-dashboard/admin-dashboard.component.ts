import { Component, signal, ElementRef, ViewChild, AfterViewInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { SurveyService } from '../../services/survey.service';
import html2canvas from 'html2canvas';
import { Chart, registerables } from 'chart.js';
import { NotificationService } from '../../services/notification.service'; // Import the notification service

Chart.register(...registerables);

interface User {
  id: number;
  name: string;
  email: string;
  dept: string;
  role: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html'
})

export class AdminDashboardComponent implements AfterViewInit {
  @ViewChild('reportContent') reportContent!: ElementRef;
  @ViewChild('lineChart') lineChartCanvas!: ElementRef;
  @ViewChild('pieChart') pieChartCanvas!: ElementRef;

  admin = signal({
    name: 'Alex Admin',
    role: 'Admin',
    email: 'admin@surveytrack.com',
    dept: 'Administration'
  });

  // Profile Modal State
  isProfileModalOpen = signal(false);
  passwordData = signal({ current: '', new: '', confirm: '' });

  // ... (existing currentView, charts, and usersList logic) ...

  // Profile Methods
  openProfile() {
    this.isProfileModalOpen.set(true);
  }

  updatePassword() {
    const { new: newPass, confirm } = this.passwordData();

    if (newPass !== confirm) {
      alert("New passwords do not match!");
      return;
    }

    if (newPass.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    // Simulate API call
    console.log("Password updated successfully");
    alert("Password updated successfully!");
    this.passwordData.set({ current: '', new: '', confirm: '' });
    this.isProfileModalOpen.set(false);
  }

  logout() {
    // Add your logout redirection logic here
    window.location.href = '/';
  }

  currentView = signal<'analytics' | 'users' | 'approvals'>('analytics');

  private surveyService = inject(SurveyService);
  private notifService = inject(NotificationService); // Inject the notification service
  pendingSurveys = this.surveyService.pendingSurveys;

  rejectSurvey(id: number) {
    if (confirm('Are you sure you want to reject this survey?')) {
      this.surveyService.updateStatus(id, 'rejected');
    }
  }

  // User Management State
  usersList = signal<User[]>([
    { id: 1, name: 'John Employee', email: 'john@company.com', dept: 'Engineering', role: 'Employee' },
    { id: 2, name: 'Sarah Manager', email: 'sarah@company.com', dept: 'Engineering', role: 'Manager' },
    { id: 3, name: 'Alex Admin', email: 'alex@company.com', dept: 'Administration', role: 'Admin' }
  ]);

  // Filtering Signals
  selectedDept = signal<string>('All');
  selectedRole = signal<string>('All');

  // Computed signal for filtered users
  filteredUsers = computed(() => {
    return this.usersList().filter(user => {
      const matchDept = this.selectedDept() === 'All' || user.dept === this.selectedDept();
      const matchRole = this.selectedRole() === 'All' || user.role === this.selectedRole();
      return matchDept && matchRole;
    });
  });

  // Modal State
  isUserModalOpen = signal(false);
  editingUser = signal<User | null>(null);

  // CRUD Methods
  openAddModal() {
    this.editingUser.set({ id: 0, name: '', email: '', dept: 'Engineering', role: 'Employee' });
    this.isUserModalOpen.set(true);
  }

  openEditModal(user: User) {
    this.editingUser.set({ ...user });
    this.isUserModalOpen.set(true);
  }

  saveUser() {
    const user = this.editingUser();
    if (!user) return;

    if (user.id === 0) {
      // Add new
      const newUser = { ...user, id: Date.now() };
      this.usersList.update(users => [...users, newUser]);
    } else {
      // Edit existing
      this.usersList.update(users => users.map(u => u.id === user.id ? user : u));
    }
    this.isUserModalOpen.set(false);
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.usersList.update(users => users.filter(u => u.id !== id));
    }
  }

  // Storage for chart instances so we can destroy/recreate them
  private charts: Chart[] = [];

  stats = signal([
    { label: 'Total Surveys', value: '2', subtext: '2 currently active', icon: '📊' },
    { label: 'Total Responses', value: '1', subtext: '1 unique participants', icon: '👥' },
    { label: 'Participation Rate', value: '2%', subtext: '1 of 50 employees', icon: '📈' },
    { label: 'Avg Response Rate', value: '68%', subtext: 'across all surveys', icon: '📉' }
  ]);

  ngAfterViewInit() {
    this.initCharts();
  }

  setView(view: 'analytics' | 'users' | 'approvals') {
    this.currentView.set(view);
    if (view === 'analytics') {
      // Small timeout to allow DOM to render the canvas elements
      setTimeout(() => this.initCharts(), 0);
    }
  }

  initCharts() {
    // Destroy existing charts to prevent memory leaks or overlay bugs
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    if (!this.lineChartCanvas || !this.pieChartCanvas) return;

    // Line Chart: Response Trends
    const line = new Chart(this.lineChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Survey Responses',
          data: [5, 12, 8, 15, 10, 4, 2],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Pie Chart: Survey Status
    const pie = new Chart(this.pieChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending', 'Draft'],
        datasets: [{
          data: [45, 35, 20],
          backgroundColor: ['#10b981', '#f59e0b', '#e2e8f0'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    this.charts.push(line, pie);
  }

  async downloadReport() {
    const element = this.reportContent.nativeElement;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Admin-Analytics-Report.pdf');
  }

  // In admin-dashboard.component.ts
approveSurvey(id: number) {
  // 1. Update the status in the survey service
  this.surveyService.updateStatus(id, 'approved');
  
  // 2. Automatically push a notification to the notification service
  // Since the service is "providedIn: 'root'", the Employee Dashboard sees this instantly
  this.notifService.addNotification(
    "A new survey has been published! Please check your dashboard.", 
    'survey'
  );
}
}

