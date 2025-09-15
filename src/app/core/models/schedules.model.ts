import { EntityState } from "@ngrx/entity";
import { StatusToggleType } from "./offeredService.model";
import { IPagination } from "./booking.model";

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

export interface ISchedules {
    id: string;
    providerId: string;
    month: string;
    days: {
        id: string;
        date: string;
        slots: {
            id: string;
            from: string;
            to: string;
            takenBy?: string;
            isActive: boolean;
        }[];
    }[];
    isActive: boolean;
    createdAt: Date;
    isDeleted: boolean;
}

export interface IScheduleList {
    id: string;
    month: string;
    totalDays: number;
    isActive: boolean;
    createdAt: Date;
}

export interface IScheduleListWithPagination {
    scheduleList: IScheduleList[];
    pagination: IPagination;
}
export interface ISlotDetails extends ISlot {
    id: string;
    isActive: boolean;
}

export interface IDaysDetails extends IDaySlot {
    id: string;
    isActive: boolean;
    slots: ISlotDetails[];
}

export interface IScheduleDetails {
    id: string;
    providerID: string;
    month: string;
    days: IDaysDetails;
    isActive: boolean;
    isDeleted: string;
    createdAt: Date;
}

export interface IUpdateScheduleStatus {
    scheduleId: string;
    status: boolean;
}

export interface IUpdateScheduleDateStatus {
    scheduleId: string;
    dayId: string;
    month: string;
    status: boolean;
}

export interface IUpdateScheduleDateSlotStatus {
    scheduleId: string;
    month: string;
    dayId: string;
    slotId: string;
    status: boolean;
}

export type AvailabilityType = 'all' | 'booked' | 'available';

export interface IScheduleDetailFilters {
    status?: StatusToggleType;
    date?: string;
    availableType?: AvailabilityType;
}

// export interface ISelectedSlot {
//     scheduleId: string,
//     month: string;
//     dayId: string;
//     slotId: string;
// }

export interface IAddress {
    coordinates: [number, number];
    address: string;
}