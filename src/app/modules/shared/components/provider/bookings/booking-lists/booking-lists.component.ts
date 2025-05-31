import { Component } from "@angular/core";
import { ProviderPaginationComponent } from "../../../../partials/sections/provider/pagenation/provider-pagination.component";

@Component({
    selector: 'app-provider-booking-lists',
    templateUrl: './booking-lists.component.html',
    imports: [ProviderPaginationComponent]
})
export class ProviderBookingListsComponent { }