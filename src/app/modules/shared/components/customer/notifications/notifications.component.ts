import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { notificationAction } from "../../../../../store/notification/notification.action";
import { BehaviorSubject, combineLatest, filter, map, Observable, of } from "rxjs";
import { INotification } from "../../../../../core/models/notification.model";
import { selectAllNotifications } from "../../../../../store/notification/notification.selector";
import { RelativeTimePipe } from "../../../../../core/pipes/relative-time.pipe";
import { NotificationType } from "../../../../../core/enums/enums";
import { NotificationSocketService } from "../../../../../core/services/socket-service/notification.service";

type NotificationCrumb = 'all' | 'booking' | 'payment' | 'system' | 'read';

@Component({
    selector: 'app-customer-notification',
    templateUrl: 'notifications.component.html',
    imports: [CommonModule, RelativeTimePipe]
})
export class CustomerNotificationComponent implements OnInit {
    private readonly _notificationService = inject(NotificationSocketService);
    private readonly _store = inject(Store);

    allNotifications$: Observable<INotification[]> = of([]);
    currentSelect: NotificationCrumb = 'all';

    filteredNotifications$: Observable<INotification[]> = of([]);

    notificationIcons: Record<NotificationType, string> = {
        [NotificationType.SYSTEM]: 'fas fa-bullhorn',
        [NotificationType.EVENT]: 'fas fa-calendar-check',
        [NotificationType.REMINDER]: 'fas fa-bell',
        [NotificationType.CUSTOM]: 'fas fa-envelope',
    };

    notificationColors: Record<NotificationType, string> = {
        [NotificationType.SYSTEM]: 'text-gray-600',
        [NotificationType.EVENT]: 'text-blue-600',
        [NotificationType.REMINDER]: 'text-yellow-500',
        [NotificationType.CUSTOM]: 'text-purple-600',
    };

    buttonOption: { text: string, value: NotificationCrumb }[] = [
        { text: 'All', value: 'all' },
        { text: 'Bookings', value: 'booking' },
        { text: 'Payments', value: 'payment' },
        { text: 'System', value: 'system' },
        { text: 'Read', value: 'read' },
    ];

    ngOnInit(): void {
        this._store.dispatch(notificationAction.fetchAllNotifications());

        this.allNotifications$ = this._store.select(selectAllNotifications);

        this.filteredNotifications$ = combineLatest([
            this.allNotifications$,
            new BehaviorSubject(this.currentSelect)
        ]).pipe(
            map(([notifications, current]) => this._filterNotifications(notifications, current)),
        );
    }

    private _filterNotifications(notifications: INotification[], filter: string): INotification[] {
        if (filter === 'all') return notifications;

        if (filter === 'read') return notifications.filter(n => n.isRead);

        // For 'booking', 'payment', 'system' → filter by templateId or type
        return notifications.filter(n =>
            n.type.toLowerCase().includes(filter) || n.templateId.toLowerCase().includes(filter)
        );
    }

    markAsRead(id: string) {
        this._notificationService.markAsRead(id);
    }

    setCurrentSelect(select: NotificationCrumb) {
        this.currentSelect = select;
        this.filteredNotifications$ = this.allNotifications$.pipe(
            map(notifications => this._filterNotifications(notifications, this.currentSelect))
        );
    }

    getIcon(type: NotificationType) {
        return this.notificationIcons[type];
    }

    getColor(type: NotificationType) {
        return this.notificationColors[type];
    }
}
