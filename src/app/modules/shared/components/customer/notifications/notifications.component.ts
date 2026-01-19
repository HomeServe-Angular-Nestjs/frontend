import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { notificationAction } from "../../../../../store/notification/notification.action";
import { BehaviorSubject, combineLatest, filter, map, Observable, of } from "rxjs";
import { INotification } from "../../../../../core/models/notification.model";
import { selectAllNotifications } from "../../../../../store/notification/notification.selector";
import { RelativeTimePipe } from "../../../../../core/pipes/relative-time.pipe";
import { NotificationTemplateId, NotificationType } from "../../../../../core/enums/enums";
import { NotificationSocketService } from "../../../../../core/services/socket-service/notification.service";
import { Router } from "@angular/router";

type NotificationCrumb = 'all' | 'booking' | 'payment' | 'system' | 'read';

@Component({
    selector: 'app-customer-notification',
    templateUrl: 'notifications.component.html',
    imports: [CommonModule, RelativeTimePipe]
})
export class CustomerNotificationComponent implements OnInit {
    private readonly _notificationService = inject(NotificationSocketService);
    private readonly _store = inject(Store);
    private readonly _router = inject(Router);

    allNotifications$: Observable<INotification[]> = of([]);
    currentSelect$ = new BehaviorSubject<NotificationCrumb>('all');

    filteredNotifications$: Observable<INotification[]> = of([]);

    notificationIcons: Record<NotificationType, string> = {
        [NotificationType.SYSTEM]: 'fas fa-bullhorn',
        [NotificationType.EVENT]: 'fas fa-calendar-check',
        [NotificationType.REMINDER]: 'fas fa-bell',
        [NotificationType.CUSTOM]: 'fas fa-envelope',
    };

    notificationColors: Record<NotificationType, string> = {
        [NotificationType.SYSTEM]: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        [NotificationType.EVENT]: 'text-blue-600 bg-blue-50 border-blue-100',
        [NotificationType.REMINDER]: 'text-amber-600 bg-amber-50 border-amber-100',
        [NotificationType.CUSTOM]: 'text-purple-600 bg-purple-50 border-purple-100',
    };

    buttonOption: { text: string, value: NotificationCrumb, icon: string }[] = [
        { text: 'All', value: 'all', icon: 'fas fa-th-large' },
        { text: 'Bookings', value: 'booking', icon: 'fas fa-calendar-alt' },
        { text: 'Payments', value: 'payment', icon: 'fas fa-credit-card' },
        { text: 'System', value: 'system', icon: 'fas fa-cog' },
    ];

    ngOnInit(): void {
        this._store.dispatch(notificationAction.fetchAllNotifications());

        this.allNotifications$ = this._store.select(selectAllNotifications);

        this.filteredNotifications$ = combineLatest([
            this.allNotifications$,
            this.currentSelect$
        ]).pipe(
            map(([notifications, current]) => this._filterNotifications(notifications, current)),
        );
    }

    private _filterNotifications(notifications: INotification[], filter: string): INotification[] {
        if (!notifications) return [];

        let sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (filter === 'all') return sorted;

        if (filter === 'read') return sorted.filter(n => n.isRead);

        return sorted.filter(n =>
            n.type.toLowerCase().includes(filter) || n.templateId.toLowerCase().includes(filter)
        );
    }

    markAsRead(id: string, event?: Event) {
        if (event) event.stopPropagation();
        this._notificationService.markAsRead(id);
    }

    markAllAsRead() {
        // Implement logic to mark all as read
        // Ideally this should send a request to backend or loop through unread ones
        // For now, let's just assume individual marking available or we need a service method for 'markAll'
        // this._notificationService.markAllAsRead(); // Assuming this exists or similar
    }

    setCurrentSelect(select: NotificationCrumb) {
        this.currentSelect$.next(select);
    }

    getIcon(type: NotificationType) {
        return this.notificationIcons[type] || 'fas fa-bell';
    }

    getColorClasses(type: NotificationType) {
        return this.notificationColors[type] || 'text-gray-600 bg-gray-50 border-gray-100';
    }

    handleNotificationClick(notification: INotification) {
        if (!notification.entityId) return;

        if ([
            NotificationTemplateId.BOOKING_CONFIRMED,
            NotificationTemplateId.BOOKING_CANCELLED
        ].includes(notification.templateId as NotificationTemplateId)) {
            this._router.navigate(['/customer/profile/bookings', notification.entityId]);
        }

        if (!notification.isRead) {
            this.markAsRead(notification.id);
        }
    }
}
