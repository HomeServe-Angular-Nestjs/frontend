import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-cancel-booking-modal',
    templateUrl: 'cancel-booking-modal.component.html',
    imports: [FormsModule]
})
export class CancelBookingModalComponent {
    @Output() closeModalEvent = new EventEmitter();
    @Output() submitModalEvent = new EventEmitter<string>();

    cancelReason = '';

    closeModal() {
        this.closeModalEvent.emit();
    }

    submitCancellation() {
        this.submitModalEvent.emit(this.cancelReason);
    }
}