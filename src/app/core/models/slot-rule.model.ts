import { WeekEnum } from "../enums/enums";

export type WeekType = `${WeekEnum}`

export interface ISlotRule {
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