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
            error
        })),

        on(notificationAction.fetchAllNotifications, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(notificationAction.addNotification, (state, { notification }) => ({
            ...state,
            notifications: notificationAdaptor.addOne(notification, state.notifications),
            loading: false,
            error: null
        })),

        on(notificationAction.removeNotification, (state, { id }) => ({
            ...state,
            notifications: notificationAdaptor.removeOne(id, state.notifications),
            loading: false,
            error: null
        })),

        on(notificationAction.markAsRead, (state, { notification }) => ({
            ...state,
            notifications: notificationAdaptor.upsertOne(notification, state.notifications),
            loading: false,
            error: null
        }))
    )
});