import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastNotificationService } from '../../../../../core/services/public/toastr.service';

@Component({
  selector: 'app-submit-cancellation',
  imports: [CommonModule, FormsModule],
  templateUrl: './submit-cancellation.component.html',
})
export class SubmitCancellationComponent {
  private readonly _toastr = inject(ToastNotificationService);

  cancelReason: string = '';

  // Notify parent to close modal
  @Output() close = new EventEmitter<void>();

  // Notify parent about submission
  @Output() submitCancel = new EventEmitter<string>();

  closeModal() {
    this.close.emit();
  }

  submitCancellation() {
    if (!this.cancelReason.trim()) {
      this._toastr.warning('Cancellation reason is required.');
      return;
    }

    if (this.cancelReason.trim().length < 10) {
      this._toastr.warning('Cancellation reason must be at least 10 characters long.');
      return;
    }

    if (this.cancelReason.trim().length > 100) {
      this._toastr.warning('Cancellation reason must be at most 100 characters long.');
      return;
    }

    this.submitCancel.emit(this.cancelReason.trim());
  }
}
