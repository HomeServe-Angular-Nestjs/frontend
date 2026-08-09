import { Component, computed, inject, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { selectProvider } from '../../../../../../store/provider/provider.selector';
import { providerActions } from '../../../../../../store/provider/provider.action';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-provider-availability-slot-rules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slot-rules.component.html',
})
export class ProviderAvailabilityComponentSlotRulesComponent implements OnDestroy {
  private readonly _providerService = inject(ProviderService);
  private readonly _store = inject(Store);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _actions$ = inject(Actions);
  private readonly _destroy$ = new Subject<void>();

  readonly provider = toSignal(
    this._store.select(selectProvider),
    { initialValue: null }
  );

  readonly isSaving = signal(false);
  readonly isLoading = signal(true);
  readonly limitReached = signal(false);

  readonly originalBufferTime = computed(
    () => this.provider()?.bufferTime ?? 0
  );

  readonly bufferTime = signal<number>(0);

  readonly MAX_BUFFER_MINUTES = 1440;

  readonly isDirty = computed(
    () => this.bufferTime() !== this.originalBufferTime()
  );

  readonly providerId = computed(() => this.provider()?.id);

  readonly exampleUnavailableUntil = computed(() => {
    const buffer = Math.max(0, this.bufferTime() ?? 0);
    const totalMinutes = 600 + 60 + buffer;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const format = (value: number) => String(value).padStart(2, '0');
    return `${format(hours)}:${format(minutes)}`;
  });

  readonly canDecrement = computed(() => (this.bufferTime() ?? 0) > 0);

  constructor() {
    effect(() => {
      this.bufferTime.set(this.originalBufferTime());
    });

    effect(() => {
      if (this.provider()) {
        this.isLoading.set(false);
      }
    });

    this._actions$
      .pipe(
        ofType(providerActions.failureAction),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.isLoading.set(false);
      });
  }

  applyStep(delta: number) {
    this.updateBuffer((this.bufferTime() ?? 0) + delta);
  }

  updateBuffer(value: number) {
    if (!Number.isFinite(value)) {
      value = 0;
    }

    this.limitReached.set(value > this.MAX_BUFFER_MINUTES);
    this.bufferTime.set(Math.min(this.MAX_BUFFER_MINUTES, Math.max(0, value)));
  }

  onBufferInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : 0;

    this.updateBuffer(value);
    input.value = String(this.bufferTime());
  }

  onSubmit() {
    if (!this.isDirty() || this.isSaving()) return;

    const bufferTime = this.bufferTime();

    if (bufferTime == null || Number.isNaN(bufferTime) || bufferTime < 0) {
      this._toastr.error('Buffer time must be a positive number.');
      return;
    }

    if (bufferTime > this.MAX_BUFFER_MINUTES) {
      this._toastr.error(`Buffer time cannot exceed ${this.MAX_BUFFER_MINUTES} minutes.`);
      return;
    }

    this.isSaving.set(true);

    this._providerService
      .updateBufferTime(bufferTime)
      .pipe(
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res?.data) {
            this._toastr.error('Failed to update buffer time.');
            return;
          }

          this._providerService.setProviderData(res.data);
          this._store.dispatch(providerActions.successAction({ provider: res.data }));
          this._toastr.success(res.message);
        },
        error: () => {
          this._toastr.error('Failed to update buffer time.');
        },
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}