import { createAction, props } from "@ngrx/store";
import { ISchedule, UpdateScheduleType } from "../../core/models/schedules.model";
import { IProvider } from "../../core/models/user.model";

export const scheduleActions = {
    fetchSchedules: createAction('[Schedules] Fetch All Schedules', props<{ providerId?: string }>()),
    fetchSchedulesSuccess: createAction('[Schedules] Fetch All Schedules Success', props<{ schedules: ISchedule[] }>()),
    fetchSchedulesFailure: createAction('[Schedule] Fetch All Schedule Failure', props<{ error: string }>()),

    updateSchedule: createAction('[Schedules] Update Schedule', props<{ updateData: UpdateScheduleType }>()),
    updateScheduleSuccess: createAction('[Schedules] Update Schedule Success', props<{
        updatedSchedule: ISchedule,
        updatedProvider: IProvider
    }>()),
    updateSchedulesFailure: createAction('[Schedule] Update Schedule Failure', props<{ error: string }>()),

    removeSchedule: createAction('[Schedule] Remove Schedule', props<{ date: string, id: string }>()),
    removeScheduleSuccess: createAction('[Schedule] Remove Schedule', props<{ removedScheduleId: string }>()),
    removeScheduleFailure: createAction('[Schedule] Remove Schedule', props<{ error: string }>()),
};