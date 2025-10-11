import { Component, EventEmitter, inject, OnDestroy, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ToastNotificationService } from "../../../../../core/services/public/toastr.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog-box/confirm-dialog.component";
import { Subject, takeUntil } from "rxjs";
import { IReportSubmit } from "../../../../../core/services/report.service";
import { CommonModule } from "@angular/common";
import { ComplaintReason } from "../../../../../core/enums/enums";

@Component({
    selector: 'app-report-modal',
    templateUrl: 'report-modal.component.html',
    imports: [CommonModule, FormsModule]
})
export class ReportModalComponent implements OnDestroy {
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _dialog = inject(MatDialog);

    private destroy$ = new Subject<void>();

    @Output() closeEvent = new EventEmitter();
    @Output() submitEvent = new EventEmitter<Omit<IReportSubmit, 'targetId'>>();

    option = '';
    text = '';
    reportReasons = [
        { value: ComplaintReason.SPAM, label: 'Spam' },
        { value:  ComplaintReason.INAPPROPRIATE, label: 'Inappropriate Service' },
        { value: ComplaintReason.HARASSMENT, label: 'Harassment' },
        { value:  ComplaintReason.OTHER, label: 'Other' }
    ];

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private _openConfirmationDialog(message: string, title: string) {
        return this._dialog.open(ConfirmDialogComponent, {
            data: { title, message },
        });
    }

    submitReport() {
        if (!this.option) {
            this._toastr.info('Must select an option.');
            return;
        }

        if (!this.text) {
            this._toastr.info('Enter the details.');
            return;
        }

        this._openConfirmationDialog(
            'Are you sure you want to submit this report? Once submitted, our team will review it.',
            'Confirm Report Submission')
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((isConfirmed) => {
                if (!isConfirmed) {
                    this.closeModal();
                    return;
                }
                this.submitEvent.emit({ reason: this.option, description: this.text })
            });
    }

    closeModal() {
        this.option = '';
        this.text = '';
        this.closeEvent.emit('');
    }
} 