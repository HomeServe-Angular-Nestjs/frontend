import { WeekEnum } from "../enums/enums";
import { IPagination } from "./booking.model";

export type WeekType = `${WeekEnum}`

export interface ISlotRule {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    daysOfWeek: WeekType[];
    startTime: string;
    endTime: string;
    breakDuration: string;
    slotDuration: string;
    capacity: string;
    isActive: boolean;
    priority: number;
    excludeDates: string[];
}

export interface ISlotRulePaginatedResponse {
    rules: ISlotRule[]
    pagination: IPagination;
}