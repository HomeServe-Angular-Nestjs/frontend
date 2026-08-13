import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'inrCurrency',
    standalone: true
})
export class InrCurrencyPipe implements PipeTransform {
    transform(value: any, maximumFractionDigits: number = 0): string {
        if (value === null || value === undefined || value === '') return '₹0';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '₹0';
        return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits });
    }
}
