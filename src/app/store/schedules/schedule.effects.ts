import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { scheduleActions } from "./schedule.action";
import { catchError, map, of, switchMap } from "rxjs";
import { ScheduleService } from "../../core/services/schedule.service";
import { HttpErrorResponse } from "@angular/common/http";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { NotificationService } from "../../core/services/public/notification.service";

export const scheduleEffects = {
    fetchScheduleEffect$: createEffect(() => {
        const actions$ = inject(Actions);
        const scheduleService = inject(ScheduleService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(scheduleActions.fetchSchedules),
            switchMap(({ providerId }) =>
                scheduleService.fetchSchedules(providerId).pipe(
                    map((schedules) => scheduleActions.fetchSchedulesSuccess({ schedules })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, scheduleActions.fetchSchedulesFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true }),

    updateSchedule$: createEffect(() => {
        const actions$ = inject(Actions);
        const scheduleService = inject(ScheduleService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(scheduleActions.updateSchedule),
            switchMap(({ updateData }) =>
                scheduleService.updateSchedule(updateData).pipe(
                    map((response) => scheduleActions.updateScheduleSuccess({
                        updatedSchedule: response.schedule,
                        updatedProvider: response.provider
                    })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, scheduleActions.updateSchedulesFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true })

}