import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'meridiem',
    standalone: true
})
export class MeridiemPipe implements PipeTransform {
    transform(time: string): string {
        if (!time) return '';

        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours, 10);
        const meridiem = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12; // the hour '0' should be '12'

        return `${hour}:${minutes} ${meridiem}`;
    }
}
