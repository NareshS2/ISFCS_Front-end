import { Injectable, signal, computed } from '@angular/core';

export interface AppNotification {
  id: number;
  message: string;
  time: Date;
  isRead: boolean;
  type: 'survey' | 'feedback' | 'system';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = signal<AppNotification[]>([]);

  // Derived signal for the unread count badge
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);
  allNotifications = this.notifications.asReadonly();

  addNotification(message: string, type: 'survey' | 'feedback' | 'system' = 'system') {
    const newNotif: AppNotification = {
      id: Date.now(),
      message,
      time: new Date(),
      isRead: false,
      type
    };
    this.notifications.update(prev => [newNotif, ...prev]);
  }

  markAllAsRead() {
    this.notifications.update(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  clearNotifications() {
    this.notifications.set([]);
  }
}