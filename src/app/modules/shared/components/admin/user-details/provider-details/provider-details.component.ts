import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { AdminService } from '../../../../../../core/services/admin.service';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';
import { IProviderDetailsBundle, VerificationStatusType } from '../../../../../../core/models/user-details.model';
import { OverviewCardComponent } from '../../../../partials/sections/admin/overview-card/admin-overview-card.component';
import { UserDetailsHeaderComponent } from '../components/user-details-header/user-details-header.component';
import { UserDetailsInfoCardComponent } from '../components/user-info-card/user-info-card.component';
import { UserBookingsTableComponent } from '../components/bookings-table/bookings-table.component';
import { UserReviewsTableComponent } from '../components/reviews-table/reviews-table.component';
import { ProviderServicesTableComponent } from '../components/services-table/services-table.component';
import { AvailabilityCardComponent } from '../components/availability-card/availability-card.component';
import { DocumentsCardComponent } from '../components/documents-card/documents-card.component';

@Component({
    selector: 'app-provider-details',
    standalone: true,
    imports: [
        CommonModule,
        UserDetailsHeaderComponent,
        OverviewCardComponent,
        UserDetailsInfoCardComponent,
        UserBookingsTableComponent,
        UserReviewsTableComponent,
        ProviderServicesTableComponent,
        AvailabilityCardComponent,
        DocumentsCardComponent
    ],
    templateUrl: './provider-details.component.html'
})
export class ProviderDetailsComponent implements OnInit, OnDestroy {
    private readonly _route = inject(ActivatedRoute);
    private readonly _adminService = inject(AdminService);
    private readonly _sharedData = inject(SharedDataService);
    private readonly destroy$ = new Subject<void>();

    bundle!: IProviderDetailsBundle;

    ngOnInit(): void {
        this._sharedData.setAdminHeader('Provider Details');
        this._route.params.pipe(
            takeUntil(this.destroy$),
            switchMap(params => this._adminService.fetchProviderDetails(params['id']))
        ).subscribe(res => {
            if (res.data) {
                this.bundle = res.data;
            }
        });
    }

    onStatusChanged(isActive: boolean): void {
        this.bundle = { ...this.bundle, profile: { ...this.bundle.profile, isActive } };
    }

    onVerificationChanged(status: VerificationStatusType): void {
        this.bundle = { ...this.bundle, profile: { ...this.bundle.profile, verificationStatus: status } };
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}