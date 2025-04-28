import { createAction, props } from "@ngrx/store";
import { ISchedule, UpdateScheduleType } from "../../core/models/schedules.model";

export const scheduleActions = {
    fetchSchedules: createAction('[Schedules] Fetch All Schedules'),
    fetchSchedulesSuccess: createAction('[Schedules] Fetch All Schedules Success', props<{ schedules: ISchedule[] }>()),
    fetchSchedulesFailure: createAction('[Schedule] Fetch All Schedule Failure', props<{ error: string }>()),

    updateSchedule: createAction('[Schedules] Update Schedule', props<{ updateData: UpdateScheduleType }>()),
    updateScheduleSuccess: createAction('[Schedules] Update Schedule Success', props<{ updatedSchedule: ISchedule }>()),
    updateSchedulesFailure: createAction('[Schedule] Update Schedule Failure', props<{ error: string }>()),
};