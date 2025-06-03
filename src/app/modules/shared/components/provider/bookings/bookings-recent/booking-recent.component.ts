import { Component, inject } from "@angular/core";
import { ProviderPaginationComponent } from "../../../../partials/sections/provider/pagenation/provider-pagination.component";
import { BookingService } from "../../../../../../core/services/booking.service";
import { IProviderBookingLists } from "../../../../../../core/models/booking.model";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-provider-booking-recent',
    templateUrl: './booking-recent.component.html',
    imports: [CommonModule,ProviderPaginationComponent]
})
export class ProviderBookingRecentComponent { 
    private readonly _bookingService = inject(BookingService);
    
        bookingLists: IProviderBookingLists[] = [];
    
        ngOnInit(): void {
            this._bookingService.fetchBookingList().subscribe(data => {
                console.log(data);
                this.bookingLists = data;
            });
        }
}