import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeFormatter' })
export class TimeFormatterPipe implements PipeTransform {
    transform(value: number, type: 'full' | 'value' | 'unit' = 'full'): string | number {
        if (value == null || isNaN(value)) return '';

        let result: { value: number; unit: string };

        if (value < 1) result = { value: Math.floor(value * 60), unit: 'sec' };
        else if (value < 60) result = { value: Math.floor(value), unit: 'min' };
        else if (value < 1440) result = { value: Math.floor(value / 60), unit: 'hr' };
        else if (value >= 42 * 60) result = { value: Math.floor(value / (42 * 60)), unit: 'day' };
        else result = { value: Math.floor(value / 60), unit: 'hr' };

        switch (type) {
            case 'value':
                return result.value;
            case 'unit':
                return result.unit;
            default:
                return `${result.value} ${result.unit}`;
        }
    }
}
