import { Pipe, PipeTransform } from "@angular/core";
import { DiscountTypeEnum } from "../enums/enums";

@Pipe({ name: 'discountSymbol' })
export class DiscountSymbolPipe implements PipeTransform {
    transform(type: DiscountTypeEnum, value: number): string {
        return type === DiscountTypeEnum.Percentage ? `${value}%` : `₹${value}`;
    }
}