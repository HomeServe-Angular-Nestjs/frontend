import { Component, inject, OnInit } from "@angular/core";
import { BookingService } from "../../../../../core/services/booking.service";
import { CommonModule } from "@angular/common";
import { FullDateWithTimePipe } from "../../../../../core/pipes/to-full-date-with-time.pipe";
import { IBookingResponse } from "../../../../../core/models/booking.model";

@Component({
    selector: 'app-customer-booking-lists',
    templateUrl: './booking-lists.component.html',
    imports: [CommonModule, FullDateWithTimePipe]
})
export class CustomerBookingListsComponent implements OnInit {
    private readonly _bookingService = inject(BookingService);

    bookingLists: IBookingResponse[] = [];

    ngOnInit(): void {
        this._bookingService.fetchBookings().subscribe(data => {
            console.log(data)
            this.bookingLists = data;
        });
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
}