import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { NotificationSocketService } from "../../core/services/socket-service/notification.service";
import { notificationAction } from "./notification.action";
import { map, switchMap } from "rxjs";
import { ToastNotificationService } from "../../core/services/public/toastr.service";

export const notificationEffects = {
    fetchAllNotifications$: createEffect(() => {
        const actions$ = inject(Actions);
        const notificationService = inject(NotificationSocketService)

        return actions$.pipe(
            ofType(notificationAction.fetchAllNotifications),
            switchMap(() =>
                notificationService.fetchAllNotifications().pipe(
                    map((response) => {
                        return notificationAction.notificationSuccess({ notifications: response.data ?? [] });
                    })
                )
            )
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
                        return notificationAction.notificationSuccess({ notifications: response.data ?? [] });
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
                        if (!response?.data) {
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