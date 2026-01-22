import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationSocketService } from '../../../../core/services/socket-service/notification.service';
import { INotification } from '../../../../core/models/notification.model';
import { NotificationType, NotificationTemplateId } from '../../../../core/enums/enums';
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-provider-notification',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css']
})
export class ProviderNotificationComponent implements OnInit {
    private readonly _notificationService = inject(NotificationSocketService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _router = inject(Router);

    notifications = signal<INotification[]>([]);
    loading = signal<boolean>(false);
    activeFilter = signal<NotificationType | 'all'>('all');

    readonly NotificationType = NotificationType;

    ngOnInit(): void {
        this.fetchNotifications();
    }

    fetchNotifications(): void {
        this.loading.set(true);
        this._notificationService.fetchAllNotifications()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this.notifications.set(res.data || []);
                    }
                },
                error: (err) => {
                    this._toastr.error('Failed to fetch notifications');
                    console.error(err);
                }
            });
    }

    get filteredNotifications() {
        const filter = this.activeFilter();
        const all = this.notifications();
        if (filter === 'all') return all;
        return all.filter(n => n.type === filter);
    }

    setFilter(filter: NotificationType | 'all'): void {
        this.activeFilter.set(filter);
    }

    markAsRead(id: string): void {
        this._notificationService.markAsReadApi(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.notifications.update(prev =>
                        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                    );
                }
            }
        });
    }

    markAllAsRead(): void {
        if (this.notifications().every(n => n.isRead)) return;

        this._notificationService.markAllAsReadApi().subscribe({
            next: (res) => {
                if (res.success) {
                    this.notifications.update(prev =>
                        prev.map(n => ({ ...n, isRead: true }))
                    );
                    this._toastr.success('All notifications marked as read');
                }
            }
        });
    }

    deleteNotification(id: string): void {
        this._notificationService.deleteNotificationApi(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.notifications.update(prev => prev.filter(n => n.id !== id));
                    this._toastr.success('Notification deleted');
                }
            }
        });
    }

    clearAll(): void {
        if (this.notifications().length === 0) return;

        if (confirm('Are you sure you want to clear all notifications?')) {
            this._notificationService.clearAllApi().subscribe({
                next: (res) => {
                    if (res.success) {
                        this.notifications.set([]);
                        this._toastr.success('All notifications cleared');
                    }
                }
            });
        }
    }

    getUnreadCount(type?: NotificationType): number {
        return this.notifications().filter(n => !n.isRead && (!type || n.type === type)).length;
    }

    handleNotificationClick(notification: INotification): void {
        if (!notification.isRead) {
            this.markAsRead(notification.id);
        }

        if (notification.templateId === NotificationTemplateId.SUBSCRIPTION_SUCCESS) {
            this._router.navigate(['/provider/subscriptions']);
        }
    }
}
