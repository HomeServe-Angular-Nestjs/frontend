import { createFeature, createReducer, on } from "@ngrx/store";
import { INotificationState } from "../../core/models/notification.model";
import { notificationAdaptor } from "./notification.entity";
import { notificationAction } from "./notification.action";

export const initialNotificationState: INotificationState = {
    notifications: notificationAdaptor.getInitialState(),
    cursor: null,
    hasMore: false,
    loading: false,
    error: null
};

export const notificationFeature = createFeature({
    name: 'notification',
    reducer: createReducer(
        initialNotificationState,

        on(notificationAction.notificationSuccess, (state, { notifications, cursor, hasMore }) => ({
            ...state,
            notifications: notificationAdaptor.setAll(notifications, state.notifications),
            cursor: cursor ?? null,
            hasMore: hasMore ?? false,
            loading: false,
            error: null
        })),

        on(notificationAction.appendNotificationsSuccess, (state, { notifications, cursor, hasMore }) => ({
            ...state,
            notifications: notificationAdaptor.addMany(notifications, state.notifications),
            cursor,
            hasMore,
            loading: false,
            error: null
        })),

        on(notificationAction.notificationFailure, (state, { error }) => ({
            ...state,
            loading: false,
            error
        })),

        on(notificationAction.fetchAllNotifications, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(notificationAction.fetchNextNotifications, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(notificationAction.addNotification, (state, { notification }) => ({
            ...state,
            notifications: notificationAdaptor.upsertOne(notification, state.notifications),
            loading: false,
            error: null
        })),

        on(notificationAction.markAllAsRead, (state) => ({
            ...state,
            loading: true,
            error: null,
        })),

        on(notificationAction.markAllReadSuccess, (state) => ({
            ...state,
            notifications: notificationAdaptor.updateMany(
                state.notifications.ids.map(id => ({ id: id as string, changes: { isRead: true } })),
                state.notifications
            ),
            loading: false,
            error: null
        })),

        on(notificationAction.removeNotification, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(notificationAction.removeNotificationSuccess, (state, { id }) => ({
            ...state,
            notifications: notificationAdaptor.removeOne(id, state.notifications),
            loading: false,
            error: null
        })),

        on(notificationAction.markAsReadSuccess, (state, { notification }) => ({
            ...state,
            notifications: notificationAdaptor.upsertOne(notification, state.notifications),
            loading: false,
            error: null
        })),

        on(notificationAction.clearAllNotificationSuccess, (state) => ({
            ...state,
            notifications: notificationAdaptor.removeAll(state.notifications),
            cursor: null,
            hasMore: false,
            loading: false,
            error: null
        }))
    )
});
