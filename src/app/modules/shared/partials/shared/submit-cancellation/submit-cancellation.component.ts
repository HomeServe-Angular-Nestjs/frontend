import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-submit-cancellation',
  imports: [CommonModule, FormsModule],
  templateUrl: './submit-cancellation.component.html',
})
export class SubmitCancellationComponent {
  cancelReason: string = '';

  // Notify parent to close modal
  @Output() close = new EventEmitter<void>();

  // Notify parent about submission
  @Output() submitCancel = new EventEmitter<string>();

  closeModal() {
    this.close.emit();
  }

  submitCancellation() {
    this.submitCancel.emit(this.cancelReason.trim());
  }
}
