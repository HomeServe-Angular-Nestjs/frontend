import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { AdminService } from '../../../../../../core/services/admin.service';
import { ICustomerDetailsBundle } from '../../../../../../core/models/user-details.model';
import { OverviewCardComponent } from '../../../../partials/sections/admin/overview-card/admin-overview-card.component';
import { UserDetailsHeaderComponent } from '../components/user-details-header/user-details-header.component';
import { UserDetailsInfoCardComponent } from '../components/user-info-card/user-info-card.component';
import { AddressListComponent } from '../components/address-list/address-list.component';
import { UserBookingsTableComponent } from '../components/bookings-table/bookings-table.component';
import { UserReviewsTableComponent } from '../components/reviews-table/reviews-table.component';

@Component({
    selector: 'app-customer-details',
    standalone: true,
    imports: [
        CommonModule,
        UserDetailsHeaderComponent,
        OverviewCardComponent,
        UserDetailsInfoCardComponent,
        AddressListComponent,
        UserBookingsTableComponent,
        UserReviewsTableComponent
    ],
    templateUrl: './customer-details.component.html'
})
export class CustomerDetailsComponent implements OnInit, OnDestroy {
    private readonly _route = inject(ActivatedRoute);
    private readonly _adminService = inject(AdminService);
    private readonly destroy$ = new Subject<void>();

    bundle!: ICustomerDetailsBundle;

    ngOnInit(): void {
        this._route.params.pipe(
            takeUntil(this.destroy$),
            switchMap(params => this._adminService.fetchCustomerDetails(params['id']))
        ).subscribe(res => {
            if (res.data) {
                this.bundle = res.data;
            }
        });
    }

    onStatusChanged(isActive: boolean): void {
        this.bundle = { ...this.bundle, profile: { ...this.bundle.profile, isActive } };
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
