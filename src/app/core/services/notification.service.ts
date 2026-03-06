import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API_URL = 'http://localhost:8081/api/notifications';

export interface Notification {
  notificationId?: number;
  id?: number;
  userId?: number;
  type?: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
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
export class NotificationService {
  constructor(private http: HttpClient) {}

  // Get unread notifications
  getNotifications(): Observable<Notification[]> {
    return this.http.get<ApiResponse<Notification[]>>(`${API_URL}`).pipe(
      map((response: ApiResponse<Notification[]>) => response.data || [])
    );
  }

  // Get notification count
  getNotificationCount(): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${API_URL}/count`).pipe(
      map((response: ApiResponse<number>) => response.data || 0)
    );
  }

  // Mark single notification as read
  markAsRead(id: number): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${API_URL}/${id}/read`, {}).pipe(
      map((response: ApiResponse<any>) => response.data)
    );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${API_URL}/read-all`, {}).pipe(
      map((response: ApiResponse<any>) => response.data)
    );
  }

  // Delete notification
  deleteNotification(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${API_URL}/${id}`).pipe(
      map((response: ApiResponse<any>) => response.data)
    );
  }
}
