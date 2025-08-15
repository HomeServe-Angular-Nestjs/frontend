import { PlanDurationType } from "../models/plan.model";

export function formatFullDateWithTimeHelper(dateInput: string | Date): string {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
        console.warn('Invalid date input:', dateInput);
        return 'Invalid Date';
    }

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    };

    return date.toLocaleString('en-US', options).replace(',', '');
}

export function getStartTimeAndEndTime(duration: PlanDurationType): { startTime: string, endDate: string | null } {
    const startTime = new Date();
    let endDate: string | null = null;

    if (duration !== 'lifetime') {
        if (duration === 'monthly') {
            const end = new Date(startTime);
            end.setMonth(end.getMonth() + 1);
            endDate = end.toISOString();
        } else if (duration === 'yearly') {
            const end = new Date(startTime);
            end.setFullYear(end.getFullYear() + 1);
            endDate = end.toISOString();
        }
    }

    return {
        startTime: startTime.toISOString(),
        endDate
    }
}

export function formatDateToYMD(value: Date | string): string {
    return new Date(value).toISOString().slice(0, 10);
}

