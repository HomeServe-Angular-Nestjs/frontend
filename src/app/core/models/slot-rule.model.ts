import { RuleSortEnum, WeekEnum } from "../enums/enums";
import { StatusType } from "./auth.model";
import { IPagination } from "./booking.model";
import { StatusToggleType } from "./offeredService.model";

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

export interface IRuleFilter {
    search?: string;
    startDate?: string;
    endDate?: string;
    ruleStatus?: StatusToggleType;
    sort?: RuleSortEnum;
}

export interface IAvailableSlot {
    from: string;
    to: string;
    ruleId: string;
    status?: boolean;
}

export interface ISelectedSlot extends IAvailableSlot {
    date: string;
}