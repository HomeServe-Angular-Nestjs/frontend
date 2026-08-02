import { createAction, props } from "@ngrx/store";
import { INotification } from "../../core/models/notification.model";

export const notificationAction = {
    notificationSuccess: createAction('[Notification] fetch notifications success.', props<{ notifications: INotification[]; cursor?: string | null; hasMore?: boolean }>()),
    notificationFailure: createAction('[Notification] fetch notifications failure.', props<{ error: string }>()),

    fetchAllNotifications: createAction('[Notification] fetch notification'),
    fetchNextNotifications: createAction('[Notification] fetch next notifications'),
    appendNotificationsSuccess: createAction('[Notification] fetch next notifications success.', props<{ notifications: INotification[]; cursor: string | null; hasMore: boolean }>()),
    addNotification: createAction('[Notification] Add notification', props<{ notification: INotification }>()),
    removeNotification: createAction('[Notification] Remove notification', props<{ id: string }>()),
    removeNotificationSuccess: createAction('[Notification] Remove notification success', props<{ id: string }>()),
    markAsRead: createAction('[Notification] mark as read', props<{ notificationId: string }>()),
    markAsReadSuccess: createAction('[Notification] mark as read success', props<{ notification: INotification }>()),
    markAllAsRead: createAction('[Notification] mark all as read'),
    markAllReadSuccess: createAction('[Notification] mark all as read success'),
    clearAllNotification: createAction('[Notification] clear all notification'),
    clearAllNotificationSuccess: createAction('[Notification] clear all notification'),
}
