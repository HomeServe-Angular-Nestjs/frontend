import { createFeature, createReducer, on } from "@ngrx/store";
import { INotificationState } from "../../core/models/notification.model";
import { notificationAdaptor } from "./notification.entity";
import { notificationAction } from "./notification.action";

export const initialNotificationState: INotificationState = {
    notifications: notificationAdaptor.getInitialState(),
    loading: false,
    error: null
};

export const notificationFeature = createFeature({
    name: 'notification',
    reducer: createReducer(
        initialNotificationState,

        on(notificationAction.notificationSuccess, (state, { notifications }) => ({
            ...state,
            notifications: notificationAdaptor.setAll(notifications, state.notifications),
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

        on(notificationAction.markAllAsRead, (state) => ({
            ...state,
            loading: true,
            error: null,
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
            loading: false,
            error: null
        }))
    )
});