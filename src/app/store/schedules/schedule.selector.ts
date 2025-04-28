import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IScheduleState } from "../../core/models/schedules.model";
import { scheduleAdaptor } from "./schedule.entity";

export const selectSchedulesState = createFeatureSelector<IScheduleState>('schedules');

export const selectSchedulesEntityState = createSelector(
    selectSchedulesState,
    (state) => state.schedules
);

export const {
    selectAll: selectAllSchedules
} = scheduleAdaptor.getSelectors(selectSchedulesEntityState);