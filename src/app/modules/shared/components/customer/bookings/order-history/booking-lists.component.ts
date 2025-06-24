import { Component, inject, OnInit } from "@angular/core";
import { BookingService } from "../../../../../../core/services/booking.service";
import { CommonModule } from "@angular/common";
import { FullDateWithTimePipe } from "../../../../../../core/pipes/to-full-date-with-time.pipe";
import { IBookingWithPagination } from "../../../../../../core/models/booking.model";
import { CustomerPaginationComponent } from "../../../../partials/sections/customer/pagination/pagination.component";
import { Observable } from "rxjs";
import { RouterLink } from "@angular/router";
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";

@Component({
    selector: 'app-customer-booking-lists',
    templateUrl: './booking-lists.component.html',
    imports: [CommonModule, FullDateWithTimePipe, CustomerPaginationComponent, RouterLink, LoadingCircleAnimationComponent]
})
export class CustomerBookingListsComponent implements OnInit {
    private readonly _bookingService = inject(BookingService);
    private readonly _toastr = inject(ToastNotificationService);

    bookingsData$!: Observable<IBookingWithPagination>;

    ngOnInit(): void {
        this._fetchBookings(1);
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

    private _fetchBookings(page: number) {
        this.bookingsData$ = this._bookingService.fetchBookings(page)
    }
}