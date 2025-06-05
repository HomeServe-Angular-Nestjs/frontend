import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { filter, map, Observable, switchMap } from "rxjs";
import { BookingService } from "../../../../../../core/services/booking.service";
import { IBookingDetails } from "../../../../../../core/models/booking.model";
import { formatFullDateWithTimeHelper } from "../../../../../../core/utils/date.util";

@Component({
    selector: 'app-customer-view-booking-details',
    templateUrl: './booking-details.component.html',
    imports: [CommonModule]
})
export class CustomerViewBookingDetailsComponent implements OnInit {
    private readonly _bookingService = inject(BookingService);
    private _route = inject(ActivatedRoute);

    bookingDetails$!: Observable<IBookingDetails>;

    ngOnInit(): void {
        this.bookingDetails$ = this._route.paramMap.pipe(
            map(param => param.get('id')),
            filter((id): id is string => !!id),
            switchMap(id => this._bookingService.fetchBookingDetails(id))
        )
    }

    formatDate(date: string): string {
        return formatFullDateWithTimeHelper(date);
    }
}