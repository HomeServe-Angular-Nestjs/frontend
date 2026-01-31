import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationSocketService } from '../../../../core/services/socket-service/notification.service';
import { INotification } from '../../../../core/models/notification.model';
import { NotificationType, NotificationTemplateId } from '../../../../core/enums/enums';
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { isNotificationLoading, selectAllNotifications } from '../../../../store/notification/notification.selector';
import { notificationAction } from '../../../../store/notification/notification.action';

@Component({
    selector: 'app-provider-notification',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css']
})
export class ProviderNotificationComponent implements OnInit, OnDestroy {
    private readonly _notificationService = inject(NotificationSocketService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _router = inject(Router);
    private readonly _store = inject(Store);
    private _destroy$ = new Subject<void>();

    notifications = signal<INotification[]>([]);
    activeFilter = signal<NotificationType | 'all'>('all');

    readonly NotificationType = NotificationType;
    readonly loading$ = this._store.select(isNotificationLoading)
        .pipe(takeUntil(this._destroy$));

    ngOnInit(): void {
        this._fetchNotifications();
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

    markAsRead(notificationId: string): void {
        this._store.dispatch(notificationAction.markAsRead({ notificationId }));
    }

    markAllAsRead(): void {
        if (this.notifications().every(n => n.isRead)) return;
        this._store.dispatch(notificationAction.markAllAsRead());
    }

    deleteNotification(id: string): void {
        this._store.dispatch(notificationAction.removeNotification({ id }));
    }

    clearAll(): void {
        if (this.notifications().length === 0) return;

        if (confirm('Are you sure you want to clear all notifications?')) {
            this._store.dispatch(notificationAction.clearAllNotification())
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

    trackById(index: number, notification: INotification): string {
        return notification.id;
    }

    private _fetchNotifications(): void {
        this._store.select(selectAllNotifications)
            .pipe(takeUntil(this._destroy$))
            .subscribe((notifications) => {
                this.notifications.set(notifications);
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
