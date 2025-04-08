// import { DatePipe } from '@angular/common';
// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
//   name: 'changeDateFormat',
//   pure: true,

// })
// export class ChangeDateFormatPipe implements PipeTransform {
//   constructor(private datePipe: DatePipe) { }

//   transform(value: string | Date | null | undefined, format: string = 'dd-mm-yyyy'): string {
//     if (!value) return '';

//     const parsedDate = new Date(value);

//     if (isNaN(parsedDate.getTime())) return 'Invalid Date';

//     return this.datePipe.transform(parsedDate, format) ?? '';
//   }
// }
