import { Component, inject, OnInit } from "@angular/core";
import { BookingService } from "../../../../../core/services/booking.service";
import { CommonModule } from "@angular/common";
import { FullDateWithTimePipe } from "../../../../../core/pipes/to-full-date-with-time.pipe";
import { IBookingResponse, IBookingWithPagination } from "../../../../../core/models/booking.model";
import { CustomerPaginationComponent } from "../../../partials/sections/customer/pagination/pagination.component";
import { Observable } from "rxjs";

@Component({
    selector: 'app-customer-booking-lists',
    templateUrl: './booking-lists.component.html',
    imports: [CommonModule, FullDateWithTimePipe, CustomerPaginationComponent]
})
export class CustomerBookingListsComponent implements OnInit {
    private readonly _bookingService = inject(BookingService);

    bookingsData$!: Observable<IBookingWithPagination>;

    ngOnInit(): void {
        this.fetchBookings(1);
    }

    canBeCancelled(date: any): boolean {
        const bookingDate = new Date(date);
        if (isNaN(bookingDate.getTime())) {
            console.warn('Invalid date input:', date);
            return false;
        }

        const now = new Date();
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

        return (now.getTime() - bookingDate.getTime()) <= twentyFourHoursInMs;
    }

    onPageChange(newPage: number) {
        this.fetchBookings(newPage); // Or however you load your data
    }

    fetchBookings(page: number) {
        this.bookingsData$ = this._bookingService.fetchBookings(page);
    }
}