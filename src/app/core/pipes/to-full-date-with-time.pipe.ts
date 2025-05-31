import { Pipe, PipeTransform } from "@angular/core";
import { formatFullDateWithTimeHelper } from "../utils/date.util";

@Pipe({
    name: 'toFullDateWithTime',
    pure: true
})
export class FullDateWithTimePipe implements PipeTransform {
    transform(date: string | Date): string {
        return formatFullDateWithTimeHelper(date);
    }
}