import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-approval-overview',
    templateUrl: './overview.component.html',
    imports: [CommonModule]
})
export class AdminApprovalOverviewComponent {
    verificationData = [
        {
            title: 'Pending Approvals',
            icon: 'fa-hourglass-half',
            iconColor: 'blue',
            count: 24,
            percentage: '+12%',
            percentageColor: 'text-blue-500',
            borderColor: 'border-blue-500'
        },
        {
            title: 'Verified Providers',
            icon: 'fa-check-circle',
            iconColor: 'green',
            count: 134,
            percentage: '+4%',
            percentageColor: 'text-green-500',
            borderColor: 'border-green-500'
        },
        {
            title: 'Flagged Profiles',
            icon: 'fa-flag',
            iconColor: 'red',
            count: 3,
            percentage: '-1%',
            percentageColor: 'text-red-500',
            borderColor: 'border-red-500'
        },
    ];
}