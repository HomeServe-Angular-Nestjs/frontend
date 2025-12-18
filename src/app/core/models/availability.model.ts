import { WeekEnum } from "../enums/enums";

export interface IDateOverride {
    id: string;
    providerId: string;
    date: string;
    timeRanges: {
        startTime: string;
        endTime: string
    }[];
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IWeeklyAvailability {
    providerId: string;
    week: {
        sun: IDayAvailability;
        mon: IDayAvailability;
        tue: IDayAvailability;
        wed: IDayAvailability;
        thu: IDayAvailability;
        fri: IDayAvailability;
        sat: IDayAvailability;
    };
}

export interface IDayAvailability {
    isAvailable: boolean;
    timeRanges: {
        startTime: string;
        endTime: string;
    }[];
}

export interface IAvailabilityListView {
    label: WeekEnum;
    active: boolean;
    timeRanges: {
        from: string;
        to: string;
    }[];
}