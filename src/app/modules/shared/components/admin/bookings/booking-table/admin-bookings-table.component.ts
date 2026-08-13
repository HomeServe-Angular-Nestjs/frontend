import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { IAdminBookingForTable, IPagination } from "../../../../../../core/models/booking.model";
import { AdminPaginationComponent } from "../../../../partials/sections/admin/pagination/pagination.component";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-admin-booking-table',
    templateUrl: './admin-bookings-table.component.html',
    imports: [CommonModule, RouterLink]
})
export class AdminBookingTableComponent {
    @Input({ required: true }) bookings: IAdminBookingForTable[] = [];

    avatarFallback(event: Event, name: string): void {
        const img = event.target as HTMLImageElement;
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((name || 'U').charAt(0).toUpperCase())}&background=0D8ABC&color=fff`;
    }
}