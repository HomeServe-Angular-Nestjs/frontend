import { EntityState } from "@ngrx/entity";

export interface ISlot {
    from: string;
    to: string;
    takenBy?: string;
}

export type SlotType = Omit<ISlot, 'takenBy'>;

export interface ISchedule {
    id: string,
    scheduleDate: string,
    slots: ISlot[];
    // status?: string;
    // bookingLimit?: number;
    // bufferTime?: string;
    // serviceArea?: [number, number];
    // serviceRadius?: number;
}

export type UpdateScheduleType = {
    scheduleDate: string,
    slot: SlotType
}

export interface IScheduleState {
    schedules: EntityState<ISchedule>,
    loading: boolean,
    error: string | null
}