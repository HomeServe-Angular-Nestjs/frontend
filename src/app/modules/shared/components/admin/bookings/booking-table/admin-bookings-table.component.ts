import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { IAdminBookingForTable, IPagination } from "../../../../../../core/models/booking.model";
import { AdminPaginationComponent } from "../../../../partials/sections/admin/pagination/pagination.component";

@Component({
    selector: 'app-admin-booking-table',
    templateUrl: './admin-bookings-table.component.html',
    imports: [CommonModule]
})
export class AdminBookingTableComponent implements OnInit {

    @Input({ required: true }) bookings: IAdminBookingForTable[] = [];

    ngOnInit(): void {

    }
}