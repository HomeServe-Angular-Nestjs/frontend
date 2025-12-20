import { PlanDuration } from "../enums/enums";

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

export function formatDateToYMD(value: Date | string): string {
    return new Date(value).toISOString().slice(0, 10);
}

export function timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTimeRanges(ranges: { startTime: string; endTime: string }[]): string {
    if (!ranges || ranges.length === 0) return '';

    return ranges
        .map(r => `${r.startTime} – ${r.endTime}`)
        .join(', ');
}