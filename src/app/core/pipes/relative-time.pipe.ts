import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
    transform(value: string | Date): string {
        if (!value) return '';

        const date = new Date(value);
        const now = new Date();

        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diffInSeconds < 60) {
            return `${diffInSeconds}s ago`;
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 60) {
            return `${diffInHours}h ago`;
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());

        return `${day}/${month}/${year}`;
    }
}