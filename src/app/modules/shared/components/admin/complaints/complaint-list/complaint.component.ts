import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from "@angular/core";
import { ReportService } from "../../../../../../core/services/report.service";
import { filter, map, Subject, switchMap, takeUntil } from "rxjs";
import { SharedDataService } from "../../../../../../core/services/public/shared-data.service";
import { IReport, IReportFilter, IReportOverViewMatrix, IReportWithPagination } from "../../../../../../core/models/report.model";
import { CommonModule } from "@angular/common";
import { AdminPaginationComponent } from "../../../../partials/sections/admin/pagination/pagination.component";
import { IPagination } from "../../../../../../core/models/booking.model";
import { DebounceService } from "../../../../../../core/services/public/debounce.service";
import { IResponse } from "../../../../models/response.model";
import { FormsModule } from "@angular/forms";
import { AdminComplaintViewComponent } from "../complaint-view/complaint-view.component";
import { ReportStatus } from "../../../../../../core/enums/enums";
import { IAdminOverViewCard, OverviewCardComponent } from "../../../../partials/sections/admin/overview-card/admin-overview-card.component";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../../../partials/shared/confirm-dialog-box/confirm-dialog.component";
import { ButtonComponent } from "../../../../../../UI/button/button.component";

@Component({
    selector: 'app-admin-complaint-management',
    templateUrl: 'complaint.component.html',
    imports: [CommonModule, FormsModule, AdminPaginationComponent, AdminComplaintViewComponent, OverviewCardComponent, ButtonComponent],
    providers: [ReportService, DebounceService]
})
export class AdminComplaintManagementComponent implements OnInit, OnDestroy {
    private readonly _sharedService = inject(SharedDataService);
    private readonly _debounceService = inject(DebounceService);
    private readonly _reportService = inject(ReportService);
    private readonly _dialog = inject(MatDialog);

    private readonly destroy$ = new Subject<void>();

    reports: IReport[] = [];
    pagination: IPagination = {
        limit: 1,
        page: 1,
        total: 1
    }

    filters: IReportFilter = {
        search: '',
        status: '',
        type: '',
    }

    isReportViewModalOpen = signal(false);
    selectedReportId!: string;

    overviewComplaints: IAdminOverViewCard[] = [
        {
            title: 'Total Complaints',
            value: 0,
            icon: 'fas fa-layer-group',
            iconBg: 'bg-indigo-100 text-indigo-700',
            subtext: 'All submitted cases',
        },
        {
            title: 'Pending',
            value: 0,
            icon: 'fas fa-clock',
            iconBg: 'bg-yellow-100 text-yellow-700',
            subtext: 'Awaiting review',
        },
        {
            title: 'Resolved',
            value: 0,
            icon: 'fas fa-check-circle',
            iconBg: 'bg-green-100 text-green-700',
            subtext: 'Closed successfully',
        },
        {
            title: 'Rejected',
            value: 0,
            icon: 'fas fa-times-circle',
            iconBg: 'bg-red-100 text-red-700',
            subtext: 'Dismissed by admin',
        },
        {
            title: 'Flagged',
            value: 0,
            icon: 'fas fa-flag',
            iconBg: 'bg-purple-100 text-purple-700',
            subtext: 'Needs further review',
        }
    ];

    ngOnInit(): void {
        this._sharedService.setAdminHeader('Complaint Management');
        this._fetchReports();
        this._fetchOverviewData();

        this._debounceService.onSearch(700)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this._fetchReports(1, this.filters);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private _fetchReports(page: number = 1, filters: IReportFilter = {}) {
        this._reportService.fetchAll({ ...filters, page })
            .pipe(
                takeUntil(this.destroy$),
                filter((res): res is Required<IResponse<IReportWithPagination>> => !!res.data),
                map(res => res.data),
            )
            .subscribe(data => {
                this.reports = data.reports ?? [];
                this.pagination = data.pagination;
            });
    }

    private _updateStatus(reportId: string, status: ReportStatus) {
        this.reports = this.reports.map(r => ({
            ...r,
            status: r.reportedId === reportId ? status : r.status
        }));
    }

    private _fetchOverviewData() {
        this._reportService.fetchOverviewData()
            .pipe(
                takeUntil(this.destroy$),
                filter((res): res is Required<IResponse<IReportOverViewMatrix>> => res.success && !!res.data),
                map(res => res.data)
            )
            .subscribe(overviewData => this.overviewComplaints = this._updateOverView(overviewData))
    }

    private _updateOverView(data: IReportOverViewMatrix): IAdminOverViewCard[] {
        return [
            {
                title: 'Total Complaints',
                value: data.total || 0,
                icon: 'fas fa-layer-group',
                iconBg: 'bg-indigo-100 text-indigo-700',
                subtext: 'All submitted cases',
            },
            {
                title: 'Pending',
                value: data.pending || 0,
                icon: 'fas fa-clock',
                iconBg: 'bg-yellow-100 text-yellow-700',
                subtext: 'Awaiting review',
            },
            {
                title: 'In Progress',
                value: data.in_progress || 0,
                icon: 'fas fa-spinner',
                iconBg: 'bg-blue-100 text-blue-700',
                subtext: 'Currently being reviewed',
            },
            {
                title: 'Resolved',
                value: data.resolved || 0,
                icon: 'fas fa-check-circle',
                iconBg: 'bg-green-100 text-green-700',
                subtext: 'Closed successfully',
            },
            {
                title: 'Rejected',
                value: data.rejected || 0,
                icon: 'fas fa-times-circle',
                iconBg: 'bg-red-100 text-red-700',
                subtext: 'Dismissed by admin',
            },
            {
                title: 'Flagged',
                value: data.resolved || 0,
                icon: 'fas fa-flag',
                iconBg: 'bg-purple-100 text-purple-700',
                subtext: 'Needs further review',
            }
        ]
    }

    private _openConfirmationDialog(message: string, title: string) {
        return this._dialog.open(ConfirmDialogComponent, {
            data: { title, message },
        });
    }

    searchReport() {
        this._debounceService.delay(this.filters?.search?.trim());
    }

    toggleSelect() {
        this._fetchReports(this.pagination.page, this.filters);
    }

    changePage(page: number) {
        this._fetchReports(page, this.filters);
    }

    toggleReportViewModal(reportId?: string) {
        if (reportId) {
            this.selectedReportId = reportId;
            this._updateStatus(reportId, ReportStatus.IN_PROGRESS)
        }
        this.isReportViewModalOpen.update(v => v = !v);
    }

    statusChanged(event: { status: ReportStatus, reportId: string }) {
        alert(event)
        this._updateStatus(event.reportId, event.status);
    }

    resolveReport(reportId: string) {
        this._openConfirmationDialog('Mark as resolved?', 'The report will be closed permanently.')
            .afterClosed()
            .pipe(
                takeUntil(this.destroy$),
                filter(isConfirmed => isConfirmed),
                switchMap(() => this._reportService.changeStatus(reportId, ReportStatus.RESOLVED)),
                filter(res => res.success)
            )
            .subscribe({
                next: () => {
                    this.reports = this.reports.map(r => ({
                        ...r, status: r.id === reportId ? ReportStatus.RESOLVED : r.status
                    }));
                }
            });
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
}