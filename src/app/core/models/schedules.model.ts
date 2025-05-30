import { EntityState } from "@ngrx/entity";

export interface ISlot {
    id: string;
    from: string;
    to: string;
    takenBy?: string;
}

export type SlotType = Omit<ISlot, 'takenBy' | 'id'>;

export interface ISchedule {
    id: string,
    scheduleDate: string,
    slots: ISlot[];
}

export interface ISlotData {
    scheduleId: string;
    slots: ISlot[];
}

export interface ISlotSource {
    slotId: string,
    scheduleId: string
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