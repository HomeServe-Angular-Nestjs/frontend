import { EntityState } from "@ngrx/entity";

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
// 

export interface ISlot {
    id?: string;
    from: string;
    to: string;
    takenBy?: string;
}

export type SlotType = Omit<ISlot, 'takenBy' | 'id'>;

export interface IMonthMode {
    month: string; // yyyy-MM
    excludeDays: string[];
    from: string;       // "09:00"
    to: string;         // "17:00"
    duration: number;   // in minutes (e.g. 60)
    buffer: number;     // in minutes (e.g. 15)
    numberOfSlots?: number;
}

export interface IDaySlot {
    date: string; // ISO: "2025-06-12"
    slots: ISlot[];
}

export interface IMonthSchedule {
    month: string; // "2025-06"
    days: IDaySlot[];
}
export interface IResponse {
    success: boolean,
    message: string,
    data?: any
}
