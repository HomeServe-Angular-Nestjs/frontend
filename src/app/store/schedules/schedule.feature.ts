import { createFeature, createReducer, on } from "@ngrx/store";
import { IScheduleState } from "../../core/models/schedules.model";
import { scheduleAdaptor } from "./schedule.entity";
import { scheduleActions } from "./schedule.action";

const initialScheduleState: IScheduleState = {
    schedules: scheduleAdaptor.getInitialState(),
    loading: false,
    error: null,
};

export const scheduleFeature = createFeature({
    name: 'schedules',
    reducer: createReducer(
        initialScheduleState,

        on(scheduleActions.fetchSchedules, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(scheduleActions.fetchSchedulesSuccess, (state, { schedules }) => ({
            ...state,
            schedules: scheduleAdaptor.setAll(schedules ?? [], state.schedules),
            loading: false,
            error: null
        })),

        on(scheduleActions.fetchSchedulesFailure, (state, { error }) => ({
            ...state,
            loading: false,
            error
        })),

        on(scheduleActions.updateSchedule, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(scheduleActions.updateScheduleSuccess, (state, { updatedSchedule }) => {
            return {
                ...state,
                loading: false,
                error: null,
                schedules: scheduleAdaptor.upsertOne(
                    updatedSchedule,
                    state.schedules
                )
            }
        }),

        on(scheduleActions.updateSchedulesFailure, (state, { error }) => ({
            ...state,
            loading: false,
            error
        })),

        on(scheduleActions.removeSchedule, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(scheduleActions.removeScheduleSuccess, (state, { removedScheduleId }) => {
            if (!removedScheduleId) {
                return {
                    ...state,
                    loading: false,
                    error: 'Id not found'
                }
            }

            const updatedEntityState = scheduleAdaptor.removeOne(removedScheduleId, state.schedules);

            return {
                ...state,
                schedules: updatedEntityState,
                loading: false,
                error: null
            }
        }),

        on(scheduleActions.removeScheduleFailure, (state, { error }) => ({
            ...state,
            loading: false,
            error
        })),
    )
});