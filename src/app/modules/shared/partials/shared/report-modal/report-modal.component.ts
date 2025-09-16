import { Component, EventEmitter, inject, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ToastNotificationService } from "../../../../../core/services/public/toastr.service";

@Component({
    selector: 'app-report-modal',
    templateUrl: 'report-modal.component.html',
    imports: [FormsModule]
})
export class ReportModalComponent {
    private readonly _toastr = inject(ToastNotificationService);

    @Output() closeEvent = new EventEmitter();
    @Output() submitEvent = new EventEmitter();

    option = '';
    text = '';

    submitReport() {
        if (!this.option) {
            this._toastr.info('Must select an option.');
            return;
        }

        if (!this.text) {
            this._toastr.info('Enter the details.');
            return;
        }

        this.submitEvent.emit({ reason: this.option, description: this.text })
    }

    closeModal() {
        this.closeEvent.emit('');
    }
} 