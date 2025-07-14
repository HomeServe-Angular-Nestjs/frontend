import { Component, inject, OnInit, signal } from "@angular/core";
import { BookingService } from "../../../../../../core/services/booking.service";
import { CommonModule } from "@angular/common";
import { FullDateWithTimePipe } from "../../../../../../core/pipes/to-full-date-with-time.pipe";
import { IBookingWithPagination } from "../../../../../../core/models/booking.model";
import { CustomerPaginationComponent } from "../../../../partials/sections/customer/pagination/pagination.component";
import { map, Observable } from "rxjs";
import { RouterLink } from "@angular/router";
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { FormsModule } from "@angular/forms";
import { BookingStatus } from "../../../../../../core/enums/enums";

@Component({
    selector: 'app-customer-booking-lists',
    templateUrl: './booking-lists.component.html',
    imports: [CommonModule, FormsModule, FullDateWithTimePipe, CustomerPaginationComponent, RouterLink, LoadingCircleAnimationComponent]
})
export class CustomerBookingListsComponent implements OnInit {
    private readonly _bookingService = inject(BookingService);
    private readonly _toastr = inject(ToastNotificationService);

    bookingsData$!: Observable<IBookingWithPagination>;
    cancellationReasonModal = false;
    cancelReason = '';
    bookingSelectedForCancellation = '';

    private _fetchBookings(page: number) {
        this.bookingsData$ = this._bookingService.fetchBookings(page)
    }

    ngOnInit(): void {
        this._fetchBookings(1);
    }

    private _updateCancelledBookingData(cancelledBookingId: string) {
        this.bookingsData$ = this.bookingsData$.pipe(
            map(response => {
                return {
                    bookingData: response.bookingData.map(bookings => {
                        if (bookings.bookingId === cancelledBookingId) {
                            return {
                                ...bookings,
                                bookingStatus: BookingStatus.CANCELLED
                            };
                        }
                        return bookings;
                    }),
                    paginationData: response.paginationData,
                }
            })
        );
    }

    canBeCancelled(date: any): boolean {
        const bookingDate = new Date(date);
        if (isNaN(bookingDate.getTime())) {
            this._toastr.warning('Invalid date input:', date);
            return false;
        }

        const now = new Date();
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

        return (now.getTime() - bookingDate.getTime()) <= twentyFourHoursInMs;
    }

    onPageChange(newPage: number) {
        this._fetchBookings(newPage);
    }

    openModal(bookingId: string) {
        this.bookingSelectedForCancellation = bookingId;
        this.cancellationReasonModal = true;
    }

    closeModal() {
        this.bookingSelectedForCancellation = '';
        this.cancellationReasonModal = false;
    }

    submitCancellation() {
        if (!this.bookingSelectedForCancellation || !this.cancelReason.trim()) {
            this._toastr.warning('Cancellation reason is required.');
            return;
        }

        this._bookingService.cancelBooking(this.bookingSelectedForCancellation, this.cancelReason).subscribe({
            next: (res) => {
                this._updateCancelledBookingData(this.bookingSelectedForCancellation);
                this.bookingSelectedForCancellation = '';
                this.cancellationReasonModal = false;
                this.cancelReason = '';
                this._toastr.success(res.message);
            },
            error: (err) => {
                console.error('Cancellation failed:', err);
                this._toastr.error(err);
            }
        })
    }
}