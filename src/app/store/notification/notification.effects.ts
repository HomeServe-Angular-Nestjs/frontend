import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { NotificationSocketService } from "../../core/services/socket-service/notification.service";
import { notificationAction } from "./notification.action";
import { map, switchMap } from "rxjs";

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

    
}