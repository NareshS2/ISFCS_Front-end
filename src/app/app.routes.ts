import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: 'employee',
        loadComponent: () => import('./features/dashboard/employee-dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent)
      },
      {
        path: 'employee/survey/:id',
        loadComponent: () => import('./features/dashboard/employee-dashboard/survey-detail/survey-detail.component').then(m => m.SurveyDetailComponent)
      },
      {
        path: 'manager',
        loadComponent: () => import('./features/dashboard/manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      { path: '', redirectTo: 'employee', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
