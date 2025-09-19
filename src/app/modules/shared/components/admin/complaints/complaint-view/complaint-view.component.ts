import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { ReportService } from "../../../../../../core/services/report.service";
import { filter, map, Subject, switchMap, takeUntil } from "rxjs";
import { IReportDetail } from "../../../../../../core/models/report.model";
import { IResponse } from "../../../../models/response.model";
import { ReportStatus } from "../../../../../../core/enums/enums";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../../../partials/shared/confirm-dialog-box/confirm-dialog.component";

@Component({
    selector: 'app-admin-complaint-view',
    templateUrl: 'complaint-view.component.html',
    imports: [CommonModule, ButtonComponent],
    providers: []
})
export class AdminComplaintViewComponent implements OnInit, OnDestroy {
    private readonly _reportService = inject(ReportService);
    private readonly _dialog = inject(MatDialog);

    private destroy$ = new Subject<void>();
    ReportStatus = ReportStatus;
    report!: IReportDetail;

    @Output() closeModalEvent = new EventEmitter();
    @Output() statusEvent = new EventEmitter<{ status: ReportStatus, reportId: string }>();
    @Input({ required: true }) reportId!: string;

    ngOnInit(): void {
        this._reportService.fetchOne(this.reportId)
            .pipe(
                takeUntil(this.destroy$),
                filter((res): res is Required<IResponse<IReportDetail>> =>
                    res.success && !!res.data),
                map(res => res.data)
            )
            .subscribe(report => this.report = report);
    }

    private _openConfirmationDialog(message: string, title: string) {
        return this._dialog.open(ConfirmDialogComponent, {
            data: { title, message },
        });
    }

    private _getConfirmationMessage(status: ReportStatus): { title: string; message: string } {
        switch (status) {
            case ReportStatus.REJECTED:
                return {
                    title: 'Reject this report?',
                    message: 'Once rejected, this action cannot be undone.'
                };
            case ReportStatus.RESOLVED:
                return {
                    title: 'Mark as resolved?',
                    message: 'The report will be closed permanently.'
                };
            default:
                return {
                    title: 'Are you sure?',
                    message: 'This action cannot be undone.'
                };
        }
    }

    public updateStatus(reportId: string, status: ReportStatus) {
        const { title, message } = this._getConfirmationMessage(status);

        this._openConfirmationDialog(title, message)
            .afterClosed()
            .pipe(
                takeUntil(this.destroy$),
                filter(isConfirmed => isConfirmed),
                switchMap(() => this._reportService.changeStatus(reportId, status)),
                filter(res => res.success)
            )
            .subscribe({
                next: () => {
                    this.report.status = status;
                    this.statusEvent.emit({ status, reportId });
                    this.closeModal();
                }
            });
    }

    closeModal() {
        this.closeModalEvent.emit('');
    }

    getReportStatusClasses(status: ReportStatus): string {
        switch (status) {
            case ReportStatus.PENDING:
                return 'bg-yellow-100 text-yellow-700';
            case ReportStatus.REJECTED:
                return 'bg-red-100 text-red-700';
            case ReportStatus.RESOLVED:
                return 'bg-green-100 text-green-700';
            case ReportStatus.IN_PROGRESS:
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    }

    isActionDisabled(status: ReportStatus): boolean {
        return status === ReportStatus.REJECTED || status === ReportStatus.RESOLVED;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete()
    }

}