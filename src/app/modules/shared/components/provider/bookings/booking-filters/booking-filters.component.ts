import { Component, EventEmitter, Output } from "@angular/core";
import { BookingStatus, DateRange, PaymentStatus, SortBy } from "../../../../../../core/enums/enums";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IBookingFilter } from "../../../../../../core/models/booking.model";

@Component({
    selector: 'app-provider-booking-filter',
    templateUrl: './booking-filters.component.html',
    imports: [CommonModule, FormsModule]
})
export class ProviderBookingFilterComponent {
    @Output() filtersChanged = new EventEmitter<IBookingFilter>();

    paymentSelectOptions: { value: PaymentStatus; label: string; }[] = [
        { value: PaymentStatus.PAID, label: 'Paid' },
        { value: PaymentStatus.UNPAID, label: 'Unpaid' },
        { value: PaymentStatus.REFUNDED, label: 'Refunded' },
        { value: PaymentStatus.FAILED, label: 'Failed' },
    ];

    bookingSelectOption: { value: BookingStatus; label: string; }[] = [
        { value: BookingStatus.PENDING, label: 'Pending' },
        { value: BookingStatus.IN_PROGRESS, label: 'In Progress' },
        { value: BookingStatus.CONFIRMED, label: 'Confirmed' },
        { value: BookingStatus.COMPLETED, label: 'Completed' },
        { value: BookingStatus.CANCELLED, label: 'Cancelled' },
    ];



    sortSelectOption: { value: SortBy; label: string; }[] = [
        { value: SortBy.NEWEST, label: 'Newest First' },
        { value: SortBy.OLDEST, label: 'Oldest First' },
        { value: SortBy.NAME_ASCENDING, label: 'Name Ascending' },
        { value: SortBy.NAME_DESCENDING, label: 'Name Descending' },
    ];


    selectedBookingStatus: BookingStatus | '' = '';
    selectedPaymentStatus: PaymentStatus | '' = '';
    selectedDateRange: Date | '' = '';
    selectedSortBy: SortBy = SortBy.NEWEST;


    changeBookingStatus(status: BookingStatus | '') {
        this.selectedBookingStatus = status;
        this._emitChanges();
    }

    changePaymentStatus(status: PaymentStatus | '') {
        this.selectedPaymentStatus = status;
        this._emitChanges();
    }

    changeDateRange(date: string) {
        this.selectedDateRange = date ? new Date(date) : '';
        this._emitChanges();
    }

    changeSortBy(sort: SortBy) {
        this.selectedSortBy = sort;
        this._emitChanges();
    }

    resetFilters() {
        this.selectedBookingStatus = '';
        this.selectedPaymentStatus = '';
        this.selectedDateRange = '';
        this.selectedSortBy = SortBy.NEWEST;
        this._emitChanges();
    }

    private _emitChanges() {
        this.filtersChanged.emit({
            date: this.selectedDateRange,
            sort: this.selectedSortBy,
            bookingStatus: this.selectedBookingStatus,
            paymentStatus: this.selectedPaymentStatus,
        });
    }
}