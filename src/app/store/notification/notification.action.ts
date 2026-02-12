import { createAction, props } from "@ngrx/store";
import { INotification } from "../../core/models/notification.model";

export const notificationAction = {
    notificationSuccess: createAction('[Notification] fetch notifications success.', props<{ notifications: INotification[] }>()),
    notificationFailure: createAction('[Notification] fetch notifications failure.', props<{ error: string }>()),

    fetchAllNotifications: createAction('[Notification] fetch notification'),
    removeNotification: createAction('[Notification] Remove notification', props<{ id: string }>()),
    removeNotificationSuccess: createAction('[Notification] Remove notification success', props<{ id: string }>()),
    markAsRead: createAction('[Notification] mark as read', props<{ notificationId: string }>()),
    markAsReadSuccess: createAction('[Notification] mark as read success', props<{ notification: INotification }>()),
    markAllAsRead: createAction('[Notification] mark all as read'),
    clearAllNotification: createAction('[Notification] clear all notification'),
    clearAllNotificationSuccess: createAction('[Notification] clear all notification'),
}