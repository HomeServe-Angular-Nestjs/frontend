import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../../../../../core/services/admin.service';
import { filter, map } from 'rxjs';
import { IApprovalOverviewData } from '../../../../../../core/models/user.model';

export interface IVerificationCardData {
    title: string;
    icon: string;
    iconColor: string;
    count: number;
    percentage: string;
    percentageColor: string;
    borderColor: string;
}

@Component({
    selector: 'app-admin-approval-overview',
    templateUrl: './overview.component.html',
    imports: [CommonModule]
})
export class AdminApprovalOverviewComponent implements OnInit {
    private readonly _adminService = inject(AdminService);


    verificationData: IVerificationCardData[] = [];

    ngOnInit(): void {
        this._adminService.fetchApprovalOverviewDetails().pipe(
            map(response => response.data),
            filter((data): data is IApprovalOverviewData => !!data)
        ).subscribe(data => {
            this.verificationData = [
                {
                    title: 'Pending Approvals',
                    icon: 'fa-hourglass-half',
                    iconColor: 'blue',
                    count: data.pending.count,
                    percentage: data.pending.percentage,
                    percentageColor: 'text-blue-500',
                    borderColor: 'border-blue-500'
                },
                {
                    title: 'Verified Providers',
                    icon: 'fa-check-circle',
                    iconColor: 'green',
                    count: data.verified.count,
                    percentage: data.verified.percentage,
                    percentageColor: 'text-green-500',
                    borderColor: 'border-green-500'
                },
                {
                    title: 'Flagged Profiles',
                    icon: 'fa-flag',
                    iconColor: 'red',
                    count: data.rejected.count,
                    percentage: data.rejected.percentage,
                    percentageColor: 'text-red-500',
                    borderColor: 'border-red-500'
                },
            ];
        });
    }
}