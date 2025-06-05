import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ProviderBookingFilterComponent } from "../../../shared/components/provider/bookings/booking-filters/booking-filters.component";
import { ProviderBookingOverviewComponent } from "../../../shared/components/provider/bookings/booking-overview/booking-overview.component";
import { ProviderBookingRecentComponent } from "../../../shared/components/provider/bookings/bookings-recent/booking-recent.component";
import { IBookingFilter } from "../../../../core/models/booking.model";

@Component({
    selector: 'app-provider-bookings',
    templateUrl: './bookings.component.html',
    imports: [CommonModule, ProviderBookingFilterComponent, ProviderBookingOverviewComponent, ProviderBookingRecentComponent]
})
export class ProviderBookingsComponent {
    filters: IBookingFilter = {};

    onFiltersChanged(updatedFilters: IBookingFilter) {
        this.filters = updatedFilters; 
    }
}