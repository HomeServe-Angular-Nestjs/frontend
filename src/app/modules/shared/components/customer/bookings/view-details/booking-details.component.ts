import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { filter, map, Observable, Subject, switchMap, takeUntil } from "rxjs";
import { BookingService } from "../../../../../../core/services/booking.service";
import { formatFullDateWithTimeHelper } from "../../../../../../core/utils/date.util";
import { IBookingDetailCustomer } from "../../../../../../core/models/booking.model";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { BookingStatus } from "../../../../../../core/enums/enums";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";

@Component({
    selector: 'app-customer-view-booking-details',
    templateUrl: './booking-details.component.html',
    imports: [CommonModule, ButtonComponent, LoadingCircleAnimationComponent]
})
export class CustomerViewBookingDetailsComponent implements OnInit {
    private readonly _bookingService = inject(BookingService);
    private readonly _route = inject(ActivatedRoute);
    private readonly _toastr = inject(ToastNotificationService);

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

    downloadInvoice(bookingId: string, bookingStatus: BookingStatus) {
        if (bookingStatus !== BookingStatus.COMPLETED) {
            this._toastr.error('You can only download invoice for completed bookings.');
            return;
        }

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