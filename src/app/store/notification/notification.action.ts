import { createAction, props } from "@ngrx/store";
import { INotification } from "../../core/models/notification.model";

export const notificationAction = {
    notificationSuccess: createAction('[Notification] fetch notifications success.', props<{ notifications: INotification[] }>()),
    notificationFailure: createAction('[Notification] fetch notifications failure.', props<{ error: string }>()),

    fetchAllNotifications: createAction('[Notification] fetch notification'),
    addNotification: createAction('[Notification] New notification sent', props<{ notification: INotification }>()),
    removeNotification: createAction('[Notification] Remove notification', props<{ id: string }>()),
    markAsRead: createAction('[Notification] mark as read', props<{ notification: INotification }>()),
}