import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API_URL = 'http://localhost:8081/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Survey {
  surveyId: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdBy: {
    id: number;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  status: 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'PENDING_APPROVAL' | 'REJECTED';
  isAnonymous: boolean;
  questions: any[];
}

export interface PaginationResponse<T> {
  content: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirst: boolean;
}

export interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) {}

  // ============== USER MANAGEMENT ==============

  // Get all users - endpoint returns array of users directly
  getAllUsers(page: number = 0, size: number = 50): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${API_URL}/admin/users`).pipe(
      map((response: ApiResponse<User[]>) => response.data || [])
    );
  }

  // Get users by role
  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${API_URL}/admin/users/role/${role}`).pipe(
      map((response: ApiResponse<User[]>) => response.data || [])
    );
  }

  // Get users by department
  getUsersByDepartment(department: string): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${API_URL}/admin/users/department/${department}`).pipe(
      map((response: ApiResponse<User[]>) => response.data || [])
    );
  }

  // Create new user
  createUser(userData: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/admin/users`, userData).pipe(
      map((response: ApiResponse<any>) => response.data)
    );
  }

  // Update user role
  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${API_URL}/admin/users/${userId}/role`, { role }).pipe(
      map((response: ApiResponse<any>) => response.data)
    );
  }

  // Update user department
  updateUserDepartment(userId: number, department: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${API_URL}/admin/users/${userId}/department`, { department }).pipe(
      map((response: ApiResponse<any>) => response.data)
    );
  }

  // Deactivate user
  deactivateUser(userId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${API_URL}/admin/users/${userId}`).pipe(
      map((response: ApiResponse<any>) => response.data)
    );
  }

  // ============== SURVEY MANAGEMENT ==============

  // Get all active surveys with pagination - returns PaginationResponse containing surveys
  getActiveSurveys(page: number = 0, size: number = 50): Observable<Survey[]> {
    return this.http.get<ApiResponse<PaginationResponse<Survey>>>(`${API_URL}/surveys/active?page=${page}&size=${size}`).pipe(
      map((response: ApiResponse<PaginationResponse<Survey>>) => {
        const paginationData = response.data;
        return paginationData?.content || [];
      })
    );
  }

  // Add this inside your AdminService class
    getPendingApprovalSurveys(page: number = 0, size: number = 50): Observable<Survey[]> {
        return this.http.get<ApiResponse<PaginationResponse<Survey>>>(`${API_URL}/surveys/pending-approval?page=${page}&size=${size}`).pipe(
        map(response => response.data?.content || [])
        );
    }

  // Get survey by ID
  getSurveyById(id: number): Observable<Survey> {
    return this.http.get<ApiResponse<Survey>>(`${API_URL}/surveys/${id}`).pipe(
      map((response: ApiResponse<Survey>) => response.data)
    );
  }

  // Publish/Approve survey
  publishSurvey(surveyId: number): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${API_URL}/surveys/${surveyId}/publish`, {}).pipe(
      map((response: ApiResponse<any>) => response.data)
    );
  }

  // Reject survey
  rejectSurvey(surveyId: number, reason: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${API_URL}/surveys/${surveyId}/reject`, { reason }).pipe(
      map((response: ApiResponse<any>) => response.data)
    );
  }

  // Delete survey
  deleteSurvey(surveyId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${API_URL}/surveys/${surveyId}/deleteSurvey`).pipe(
      map((response: ApiResponse<any>) => response.data)
    );
  }
}
