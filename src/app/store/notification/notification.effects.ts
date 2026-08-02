import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { NotificationSocketService } from "../../core/services/socket-service/notification.service";
import { notificationAction } from "./notification.action";
import { map, switchMap, withLatestFrom } from "rxjs";
import { ToastNotificationService } from "../../core/services/public/toastr.service";
import { Store } from "@ngrx/store";
import { selectNotificationCursor } from "./notification.selector";

const NOTIFICATION_PAGE_LIMIT = 20;

export const notificationEffects = {
    fetchAllNotifications$: createEffect(() => {
        const actions$ = inject(Actions);
        const notificationService = inject(NotificationSocketService)

        return actions$.pipe(
            ofType(notificationAction.fetchAllNotifications),
            switchMap(() =>
                notificationService.fetchAllNotifications(undefined, NOTIFICATION_PAGE_LIMIT).pipe(
                    map((response) => {
                        return notificationAction.notificationSuccess({
                            notifications: response.data?.data ?? [],
                            cursor: response.data?.nextCursor ?? null,
                            hasMore: response.data?.hasMore ?? false,
                        });
                    })
                )
            )
        )
    }, { functional: true }),

    fetchNextNotifications$: createEffect(() => {
        const actions$ = inject(Actions);
        const notificationService = inject(NotificationSocketService)
        const store = inject(Store)

        return actions$.pipe(
            ofType(notificationAction.fetchNextNotifications),
            withLatestFrom(store.select(selectNotificationCursor)),
            switchMap(([_, cursor]) => {
                if (!cursor) return [];
                return notificationService.fetchAllNotifications(cursor, NOTIFICATION_PAGE_LIMIT).pipe(
                    map((response) => {
                        return notificationAction.appendNotificationsSuccess({
                            notifications: response.data?.data ?? [],
                            cursor: response.data?.nextCursor ?? null,
                            hasMore: response.data?.hasMore ?? false,
                        });
                    })
                )
            })
        )
    }, { functional: true }),

    markAllAsRead$: createEffect(() => {
        const actions$ = inject(Actions);
        const notificationService = inject(NotificationSocketService)
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(notificationAction.markAllAsRead),
            switchMap(() =>
                notificationService.markAllAsReadApi().pipe(
                    map((response) => {
                        toastr.success(response.message);
                        return notificationAction.markAllReadSuccess();
                    })
                )
            )
        )
    }, { functional: true }),

    markAsRead$: createEffect(() => {
        const actions$ = inject(Actions);
        const notificationService = inject(NotificationSocketService)
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(notificationAction.markAsRead),
            switchMap(({ notificationId }) =>
                notificationService.markAsReadApi(notificationId).pipe(
                    map((response) => {
                        if (!response?.data) {
                            toastr.error(response.message);
                            return notificationAction.notificationFailure({ error: response.message });
                        }
                        toastr.success(response.message);
                        return notificationAction.markAsReadSuccess({ notification: response.data });
                    })
                )
            )
        )
    }, { functional: true }),

    removeNotification$: createEffect(() => {
        const actions$ = inject(Actions);
        const notificationService = inject(NotificationSocketService)
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(notificationAction.removeNotification),
            switchMap(({ id }) =>
                notificationService.deleteNotificationApi(id).pipe(
                    map((response) => {
                        if (!response?.success) {
                            toastr.error(response.message);
                            return notificationAction.notificationFailure({ error: response.message });
                        }
                        toastr.success(response.message);
                        return notificationAction.removeNotificationSuccess({ id });
                    })
                )
            )
        )
    }, { functional: true }),

    clearAllNotifications$: createEffect(() => {
        const actions$ = inject(Actions);
        const notificationService = inject(NotificationSocketService)
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(notificationAction.clearAllNotification),
            switchMap(() =>
                notificationService.clearAllApi().pipe(
                    map((response) => {
                        toastr.success(response.message);
                        return notificationAction.clearAllNotificationSuccess();
                    })
                )
            )
        )
    }, { functional: true })
}
