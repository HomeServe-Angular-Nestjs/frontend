import { Component, computed, inject, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { FormsModule } from '@angular/forms';
import { Subject, finalize, map, takeUntil } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-provider-availability-slot-rules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slot-rules.component.html',
})
export class ProviderAvailabilityComponentSlotRulesComponent implements OnDestroy {
  private readonly _providerService = inject(ProviderService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _destroy$ = new Subject<void>();

  readonly providerData = toSignal(
    this._providerService.providerData$,
    { initialValue: null }
  );

  readonly isSaving = signal(false);

  readonly originalBufferTime = computed(
    () => this.providerData()?.bufferTime ?? 0
  );

  readonly bufferTime = signal<number>(0);

  readonly isDirty = computed(
    () => this.bufferTime() !== this.originalBufferTime()
  );

  readonly providerId = computed(() => this.providerData()?.id);

  constructor() {
    effect(() => {
      this.bufferTime.set(this.originalBufferTime());
    });
  }

  onSubmit() {
    if (!this.isDirty() || this.isSaving()) return;

    const bufferTime = this.bufferTime();

    if (bufferTime == null || Number.isNaN(bufferTime) || bufferTime < 0) {
      this._toastr.error('Buffer time must be a positive number.');
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
          this._toastr.success(res.message);
        },
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
