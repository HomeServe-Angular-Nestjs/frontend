import { Component, effect, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { ISubscriptionFilters, SubscriptionStatusType } from '../../../../../../core/models/subscription.model';
import { PaymentStatus, PlanDuration } from '../../../../../../core/enums/enums';

@Component({
  selector: 'app-admin-subscription-filters',
  templateUrl: './subscription-filters.component.html',
  imports: [FormsModule],
  providers: [DebounceService],
})
export class SubscriptionFiltersComponent implements OnDestroy {
  private readonly _debounceService = inject(DebounceService);
  private destroy$ = new Subject<void>();

  @Output() filterEvent = new EventEmitter();

  filters = signal<ISubscriptionFilters>({
    search: '',
    status: 'all',
    payment: 'all',
    duration: 'all',
  });
  constructor() {
    this._debounceService.onSearch()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.filters.update(f => ({ ...f, search: value }))
      });

    effect(() => {
      const currentFilters = this.filters();
      this.filterEvent.emit(currentFilters);
    });
  }

  onSearch(value: string) {
    this._debounceService.delay(value);
  }

  onStatusChange(value: SubscriptionStatusType) {
    this.filters.update(f => ({ ...f, status: value }))
  }

  onPaymentChange(value: PaymentStatus) {
    this.filters.update(f => ({ ...f, payment: value }))
  }

  onDurationChange(value: PlanDuration) {
    this.filters.update(f => ({ ...f, duration: value }))
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
