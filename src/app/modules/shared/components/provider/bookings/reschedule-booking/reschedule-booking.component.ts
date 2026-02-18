import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map, tap, finalize, switchMap, EMPTY, take } from 'rxjs';
import { MeridiemPipe } from '../../../../../../core/pipes/meridiem-time.pipe';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { ISelectedSlot, ISlotUI } from '../../../../../../core/models/availability.model';
import { getToday } from '../../../../../../core/utils/date.util';
import { Store } from '@ngrx/store';
import { selectAuthUserId } from '../../../../../../store/auth/auth.selector';
import { IRescheduleData } from '../../../../../../core/models/booking.model';

@Component({
    selector: 'app-reschedule-booking',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MeridiemPipe
    ],
    templateUrl: './reschedule-booking.component.html'
})
export class RescheduleBookingModalComponent implements OnInit {
    private readonly _providerService = inject(ProviderService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _store = inject(Store);

    @Input() bookingId!: string;
    @Input() totalDurationInMinutes!: number;

    @Output() close = new EventEmitter<void>();
    @Output() submitReschedule = new EventEmitter<IRescheduleData>();

    readonly today = getToday();

    selectedDate: string = this.today;
    availableSlots: ISlotUI[] = [];
    selectedSlot: ISlotUI | null = null;
    loadingSlots = signal(false);

    ngOnInit(): void {
        this.getAvailableSlots();
    }

    getAvailableSlots() {
        if (!this.selectedDate) return;

        this._store.select(selectAuthUserId)
            .pipe(
                take(1),
                tap(() => {
                    this.loadingSlots.set(true);
                    this.selectedSlot = null;
                    this.availableSlots = [];
                }),
                switchMap((providerId) => {
                    if (!providerId) {
                        this._toastr.error('Something went wrong!');
                        console.error('Failed to get provider id for the reschedule modal.');
                        return EMPTY;
                    }

                    return this._providerService.fetchRescheduleSlots(
                        providerId,
                        this.selectedDate,
                        this.totalDurationInMinutes
                    );
                }),
                map((res) => Array.isArray(res) ? res : (res?.data || [])),
                tap((slots) => {
                    this.availableSlots = slots;
                }),
                finalize(() => this.loadingSlots.set(false))
            )
            .subscribe();
    }

    selectSlot(slot: ISlotUI) {
        if (slot.isAvailable) {
            this.selectedSlot = slot;
        }
    }

    onConfirm() {
        if (!this.selectedDate || !this.selectedSlot) {
            this._toastr.error('Please select a date and a time slot');
            return;
        }

        this.submitReschedule.emit({
            selectedSlot: {
                date: this.selectedDate,
                from: this.selectedSlot.from,
                to: this.selectedSlot.to,
            },
            bookingId: this.bookingId
        });
    }

    onClose() {
        this.close.emit();
    }
}
