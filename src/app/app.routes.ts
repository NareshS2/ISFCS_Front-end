import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
// Import the new dashboard component
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { ManagerDashboardComponent } from './components/manager-dashboard/manager-dashboard.component';
import { CreateSurveyComponent } from './components/create-survey/create-survey.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  // 1. Default path shows Login
  { path: '', component: LoginComponent },
  
  // 2. Dashboard path
  { path: 'dashboard', component: EmployeeDashboardComponent },
  
  { path: 'manager-dashboard', component: ManagerDashboardComponent }, // Route name

  { path: 'create-survey', component: CreateSurveyComponent },

  { path: 'admin-dashboard', component: AdminDashboardComponent },

  // 3. Optional: Redirect any unknown URLs back to login
  { path: '**', redirectTo: '' }
];