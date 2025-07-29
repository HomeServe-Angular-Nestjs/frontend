import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ProviderBookingFilterComponent } from "../../../shared/components/provider/bookings/booking-filters/booking-filters.component";
import { ProviderBookingOverviewComponent } from "../../../shared/components/provider/bookings/booking-overview/booking-overview.component";
import { ProviderBookingRecentComponent } from "../../../shared/components/provider/bookings/bookings-recent/booking-recent.component";
import { IBookingFilter } from "../../../../core/models/booking.model";
import { SharedDataService } from "../../../../core/services/public/shared-data.service";

@Component({
    selector: 'app-provider-bookings',
    templateUrl: './bookings.component.html',
    imports: [CommonModule, ProviderBookingFilterComponent, ProviderBookingOverviewComponent, ProviderBookingRecentComponent]
})
export class ProviderBookingsComponent implements OnInit {
    private readonly _sharedService = inject(SharedDataService);

    filters: IBookingFilter = {};

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Booking Management')
    }

    onFiltersChanged(updatedFilters: IBookingFilter) {
        this.filters = updatedFilters;
    }
}