import { Component } from "@angular/core";
import { ProviderPaginationComponent } from "../../../../partials/sections/provider/pagenation/provider-pagination.component";

@Component({
    selector: 'app-provider-booking-recent',
    templateUrl: './booking-recent.component.html',
    imports: [ProviderPaginationComponent]
})
export class ProviderBookingRecentComponent { }