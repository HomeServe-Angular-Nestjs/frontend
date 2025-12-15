import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IAdminBookingFilter } from "../../../../../../core/models/booking.model";
import { DebounceService } from "../../../../../../core/services/public/debounce.service";
import { Subject, takeUntil } from "rxjs";
import { BookingStatus, PaymentStatus } from "../../../../../../core/enums/enums";

@Component({
    selector: 'app-admin-booking-filters',
    templateUrl: './booking-filter.component.html',
    imports: [FormsModule],
    providers: [DebounceService]
})
export class AdminBookingFilterComponent implements OnInit, OnDestroy {
    private readonly _debounceService = inject(DebounceService);
    private _destroy$ = new Subject<void>();
    @Output() filterEvent = new EventEmitter<IAdminBookingFilter>();

    public filter: IAdminBookingFilter = {
        search: '',
        bookingStatus: 'all',
        paymentStatus: 'all'
    }

    ngOnInit(): void {
        this._debounceService.onSearch()
            .pipe(takeUntil(this._destroy$))
            .subscribe((text) => {
                this.filter.search = text;
                this.applyFilter();
            })
    }

    applyFilter() {
        this.filterEvent.emit(this.filter);
    }

    onSearchChange(text: string) {
        this._debounceService.delay(text)
    }

    onBookingStatusChange(status: BookingStatus | 'all') {
        this.filter.bookingStatus = status;
        this.applyFilter();
    }

    onPaymentStatusChange(status: PaymentStatus | 'all') {
        this.filter.paymentStatus = status;
        this.applyFilter();
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}