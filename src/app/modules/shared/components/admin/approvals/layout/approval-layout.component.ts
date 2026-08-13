import { Component, inject, OnInit } from "@angular/core";
import { AdminApprovalFilterComponent, ApprovalFilter } from "../filters/approval-filter.component";
import { filter, map } from "rxjs";
import { AdminService } from "../../../../../../core/services/admin.service";
import { IApprovalTableDetails } from "../../../../../../core/models/user.model";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { VerificationStatusType } from "../../../../../../core/models/user-details.model";

@Component({
    selector: 'app-admin-approval-layout',
    templateUrl: './approval-layout.component.html',
    imports: [CommonModule, AdminApprovalFilterComponent],
})
export class AdminApprovalLayoutComponent implements OnInit {
    private readonly _adminService = inject(AdminService);
    private readonly _router = inject(Router);

    private _approvals: IApprovalTableDetails[] = [];
    approvals: IApprovalTableDetails[] = [];

    summary = { pending: 0, verified: 0, rejected: 0 };

    ngOnInit(): void {
        this._adminService.fetchApprovalTableData().pipe(
            map(response => response.data),
            filter((data): data is IApprovalTableDetails[] => !!data),
        ).subscribe(data => {
            this._approvals = data;
            this._computeSummary();
            this.approvals = data;
        });
    }

    private _computeSummary(): void {
        this.summary = {
            pending: this._approvals.filter(a => a.verificationStatus === 'pending').length,
            verified: this._approvals.filter(a => a.verificationStatus === 'verified').length,
            rejected: this._approvals.filter(a => a.verificationStatus === 'rejected').length,
        };
    }

    onFilterChange(f: ApprovalFilter): void {
        const term = f.search?.trim().toLowerCase() || '';
        this.approvals = this._approvals.filter(a => {
            const matchesSearch = !term ||
                a.name.toLowerCase().includes(term) ||
                a.email.toLowerCase().includes(term) ||
                a.id.toLowerCase().includes(term);
            const matchesStatus = !f.status || a.verificationStatus === f.status;
            const matchesDate = !f.date ||
                new Date(a.date).toLocaleDateString('en-CA') === f.date;
            return matchesSearch && matchesStatus && matchesDate;
        });
    }

    badgeClass(status: VerificationStatusType): string {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-700 ring-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 ring-red-200';
            default: return 'bg-yellow-100 text-yellow-700 ring-yellow-200';
        }
    }

    badgeLabel(status: VerificationStatusType): string {
        switch (status) {
            case 'verified': return 'Verified';
            case 'rejected': return 'Rejected';
            default: return 'Pending';
        }
    }

    sliceId(id: string): string {
        return id && id.length > 8 ? `#${id.slice(-8)}` : (id ? `#${id}` : '-');
    }

    initials(name: string): string {
        return (name || '?')
            .split(' ')
            .filter(Boolean)
            .map(part => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    avatarFallback(event: Event, name: string): void {
        const img = event.target as HTMLImageElement;
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.initials(name) || 'U')}&background=0D8ABC&color=fff`;
    }

    openProvider(providerId: string): void {
        this._router.navigate(['/admin/providers', providerId]);
    }
}
