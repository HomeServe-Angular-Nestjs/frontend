import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ProviderBookingFilterComponent } from "../../../shared/components/provider/bookings/booking-filters/booking-filters.component";
import { ProviderBookingOverviewComponent } from "../../../shared/components/provider/bookings/booking-overview/booking-overview.component";
import { ProviderBookingListsComponent } from "../../../shared/components/provider/bookings/booking-lists/booking-lists.component";
import { ProviderBookingRecentComponent } from "../../../shared/components/provider/bookings/bookings-recent/booking-recent.component";

@Component({
    selector: 'app-provider-bookings',
    templateUrl: './bookings.component.html',
    imports: [CommonModule, ProviderBookingFilterComponent, ProviderBookingOverviewComponent, ProviderBookingListsComponent, ProviderBookingRecentComponent]
})
export class ProviderBookingsComponent { }