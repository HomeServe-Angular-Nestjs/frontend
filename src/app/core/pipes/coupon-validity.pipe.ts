import { inject, Pipe, PipeTransform } from "@angular/core";
import { UsageTypeEnum } from "../enums/enums";
import { DatePipe } from "@angular/common";

@Pipe({ name: 'couponValidity' })
export class CouponValidityPipe implements PipeTransform {
    private _datePipe = inject(DatePipe);

    transform(type: UsageTypeEnum, validFrom: string | null, validTo: string | null): string {
        if (type !== UsageTypeEnum.Expiry || !validFrom || !validTo) {
            return '—';
        }

        return `${this.format(validFrom)} to ${this.format(validTo)}`;
    }

    private format(dateStr: string): string | null {
        const date = new Date(dateStr);
        const format = 'dd/MM/yyyy';
        return this._datePipe.transform(date, format);
    }
}