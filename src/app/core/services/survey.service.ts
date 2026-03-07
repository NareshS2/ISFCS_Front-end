import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API_URL = 'http://localhost:8081/api';

export interface Survey {
  surveyId: number;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  questions: Question[];
  isAnonymous: boolean;
}

export interface Option {
  optionId: number;
  text: string; // Changed from optionText to text
}

export interface Question {
  questionId: number;
  text: string;
  type: 'MCQ' | 'RATING' | 'TEXT';
  options?: Option[];
}

export interface Option {
  optionId: number;
  optionText: string;
}

export interface AnswerRequestDTO {
  questionId: number;
  value: string;
}

export interface ResponseRequestDTO {
  answers: AnswerRequestDTO[];
  isAnonymous: boolean; // Ensure this matches the Java field name exactly
}

export interface SuccessResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
  timeStamp?: string;
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

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  constructor(private http: HttpClient) {}

  // Get active surveys for employee
  getActiveSurveys(page: number = 0, size: number = 20): Observable<Survey[]> {
    return this.http.get<SuccessResponse<PaginationResponse<Survey>>>(`${API_URL}/surveys/active?page=${page}&size=${size}`).pipe(
      map((response: SuccessResponse<PaginationResponse<Survey>>) => {
        const paginationData = response.data;
        return paginationData?.content || [];
      })
    );
  }

  // Get single survey by ID
  getSurveyById(id: number): Observable<Survey> {
    return this.http.get<SuccessResponse<Survey>>(`${API_URL}/surveys/${id}`).pipe(
      map((response: SuccessResponse<Survey>) => {
        console.log('Raw API response:', response);
        console.log('Extracted data:', response.data);
        return response.data;
      })
    );
  }

 // Update the method in your SurveyService class
submitSurveyResponse(surveyId: number, response: ResponseRequestDTO): Observable<any> {
  // Path must match @RequestMapping("/api/surveys/{surveyId}/responses")
  return this.http.post<SuccessResponse<any>>(`${API_URL}/surveys/${surveyId}/responses`, response).pipe(
    map((response: SuccessResponse<any>) => response.data)
  );
}

  // Search surveys client-side
  searchSurveys(keyword: string, surveys: Survey[]): Survey[] {
    if (!keyword.trim()) {
      return surveys;
    }
    const lowerKeyword = keyword.toLowerCase();
    return surveys.filter(survey =>
      survey.title.toLowerCase().includes(lowerKeyword) ||
      survey.description.toLowerCase().includes(lowerKeyword)
    );
  }
}
