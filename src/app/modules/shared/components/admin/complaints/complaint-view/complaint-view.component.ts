import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { ReportService } from "../../../../../../core/services/report.service";
import { filter, map, Subject, switchMap, takeUntil } from "rxjs";
import { IReportDetail } from "../../../../../../core/models/report.model";
import { IResponse } from "../../../../models/response.model";
import { ReportStatus } from "../../../../../../core/enums/enums";
import { MatDialog } from "@angular/material/dialog";
import { ResolutionDialogComponent } from "../../../../partials/shared/resolution-dialog/resolution-dialog.component";

@Component({
    selector: 'app-admin-complaint-view',
    templateUrl: 'complaint-view.component.html',
    imports: [CommonModule, FormsModule, ButtonComponent],
    providers: []
})
export class AdminComplaintViewComponent implements OnInit, OnDestroy {
    private readonly _reportService = inject(ReportService);
    private readonly _dialog = inject(MatDialog);
    private readonly _router = inject(Router);

    private destroy$ = new Subject<void>();
    ReportStatus = ReportStatus;
    report!: IReportDetail;

    isSavingNotes = signal(false);
    notesSaved = signal(false);

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
            .subscribe(report => {
                this.report = report;
                this.notesSaved.set(false);
            });
    }

    isActionDisabled(status: ReportStatus): boolean {
        return status === ReportStatus.REJECTED || status === ReportStatus.RESOLVED;
    }

    isReviewVisible(): boolean {
        return this.report?.type === 'review'
            && !this.isActionDisabled(this.report.status)
            && !!this.report.related?.review?.isActive;
    }

    saveNotes() {
        const notes = this.report.investigationNotes?.trim() ?? '';
        if (this.isSavingNotes() || !notes) return;
        this.isSavingNotes.set(true);
        this.notesSaved.set(false);
        this._reportService.updateInvestigationNotes(this.report.id, notes)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.isSavingNotes.set(false);
                    this.notesSaved.set(true);
                },
                error: () => {
                    this.isSavingNotes.set(false);
                }
            });
    }

    public updateStatus(status: ReportStatus) {
        const isResolve = status === ReportStatus.RESOLVED;

        const dialogRef = this._dialog.open(ResolutionDialogComponent, {
            data: {
                title: isResolve ? 'Resolve this complaint?' : 'Reject this complaint?',
                message: isResolve
                    ? 'Provide a note explaining how the complaint was resolved.'
                    : 'Provide a note explaining why the complaint is being rejected.',
                isResolve
            },
        });

        dialogRef.afterClosed()
            .pipe(
                takeUntil(this.destroy$),
                filter((result): result is { note: string } => !!result && !!result.note),
                switchMap(({ note }) => this._reportService.changeStatus(this.reportId, status, note)),
                filter(res => res.success)
            )
            .subscribe({
                next: () => {
                    this.report.status = status;
                    this.statusEvent.emit({ status, reportId: this.reportId });
                    this.closeModal();
                }
            });
    }

    openProfile() {
        this._router.navigate(['/admin/users']);
    }

    openReviewModeration() {
        this._router.navigate(['/admin/ratings&reviews']);
    }

    openBooking(bookingId: string) {
        this._router.navigate(['/admin/booking_details', bookingId]);
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
            default:
                return 'bg-gray-100 text-gray-700';
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete()
    }

}