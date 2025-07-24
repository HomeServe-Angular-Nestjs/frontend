import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IAdminBookingFilter } from "../../../../../../core/models/booking.model";

@Component({
    selector: 'app-admin-booking-filters',
    templateUrl: './booking-filter.component.html',
    imports: [FormsModule]
})
export class AdminBookingFilterComponent {
    @Output() filterEvent = new EventEmitter<IAdminBookingFilter>();

    public filter: IAdminBookingFilter = {
        searchBy: 'id',
        search: '',
        bookingStatus: '',
        paymentStatus: ''
    }

    applyFilter() {
        this.filterEvent.emit(this.filter);
    }
}