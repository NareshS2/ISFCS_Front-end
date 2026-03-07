import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8081/api';

export interface Survey {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  createdBy: string;
  totalResponses: number;
  status: 'ACTIVE' | 'DRAFT' | 'CLOSED';
}

export interface SurveyRequestDTO {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  questions: any[];
}

export interface SurveyStats {
  totalSurveys: number;
  totalResponses: number;
  averageResponseRate: number;
  activeSurveys: number;
}

@Injectable({
  providedIn: 'root'
})
export class ManagerSurveyService {
  constructor(private http: HttpClient) {}

  // Get all surveys created by the logged-in manager
  getManagerSurveys(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${API_URL}/surveys/manager`, { params });
  }

  // Get a specific survey by ID
  getSurveyById(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/surveys/${id}`);
  }

  // Create a new survey
  createSurvey(surveyData: SurveyRequestDTO): Observable<any> {
    return this.http.post<any>(`${API_URL}/surveys`, surveyData);
  }

  // Add this method: Submit a survey for approval
  submitSurvey(id: number): Observable<any> {
    return this.http.patch<any>(`${API_URL}/surveys/${id}/submit`, {});
  }

  // Update a survey
  updateSurvey(id: number, surveyData: SurveyRequestDTO): Observable<any> {
    return this.http.put<any>(`${API_URL}/surveys/${id}`, surveyData);
  }

  // Delete a survey
  deleteSurvey(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/surveys/${id}`);
  }

  // Get statistics for manager's surveys
  getManagerSurveyStats(): Observable<SurveyStats> {
    return this.http.get<SurveyStats>(`${API_URL}/surveys/manager/stats`);
  }

  // Get responses for a specific survey
  getSurveyResponses(surveyId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${API_URL}/surveys/${surveyId}/responses`, { params });
  }
}
