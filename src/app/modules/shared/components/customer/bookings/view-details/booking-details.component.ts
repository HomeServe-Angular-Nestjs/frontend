import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { filter, map, Observable, Subject, switchMap, takeUntil } from "rxjs";
import { BookingService } from "../../../../../../core/services/booking.service";
import { formatFullDateWithTimeHelper } from "../../../../../../core/utils/date.util";
import { IBookingDetailCustomer } from "../../../../../../core/models/booking.model";
import { ButtonComponent } from "../../../../../../UI/button/button.component";

@Component({
    selector: 'app-customer-view-booking-details',
    templateUrl: './booking-details.component.html',
    imports: [CommonModule, ButtonComponent]
})
export class CustomerViewBookingDetailsComponent implements OnInit {
    private readonly _bookingService = inject(BookingService);
    private readonly _route = inject(ActivatedRoute);

    private _destroy$ = new Subject<void>();
    bookingDetails$!: Observable<IBookingDetailCustomer>;

    ngOnInit(): void {
        this.bookingDetails$ = this._route.paramMap.pipe(
            takeUntil(this._destroy$),
            map(param => param.get('id')),
            filter((id): id is string => !!id),
            switchMap(id => this._bookingService.fetchBookingDetails(id))
        )
    }

    formatDate(date: string): string {
        return formatFullDateWithTimeHelper(date);
    }

    downloadInvoice(bookingId: string) {
        this._bookingService.downloadInvoice(bookingId)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'booking-invoice.pdf';
                    a.click();
                    URL.revokeObjectURL(url);
                }
            })
    }
}