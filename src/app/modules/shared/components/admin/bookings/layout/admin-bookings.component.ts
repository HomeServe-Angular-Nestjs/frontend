import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { AdminService } from "../../../../../../core/services/admin.service";
import { AdminBookingTableComponent } from "../booking-table/admin-bookings-table.component";
import { IAdminBookingForTable, IBookingStats } from "../../../../../../core/models/booking.model";
import { map, Observable } from "rxjs";
import { SharedDataService } from "../../../../../../core/services/public/shared-data.service";
import { AdminBookingFilterComponent } from "../booking-filter/booking-filter.component";
import { _VisuallyHiddenLoader } from "@angular/cdk/private";
import { IAdminOverViewCard, OverviewCardComponent } from "../../../../partials/sections/admin/overview-card/admin-overview-card.component";

@Component({
    selector: 'app-admin-bookings',
    templateUrl: './admin-bookings.component.html',
    imports: [CommonModule, AdminBookingTableComponent, AdminBookingFilterComponent, OverviewCardComponent]
})
export class AdminBookingLayoutComponent implements OnInit {
    private readonly _adminService = inject(AdminService);
    private readonly _sharedData = inject(SharedDataService);

    bookings$!: Observable<IAdminBookingForTable[]>;
    stats!: IAdminOverViewCard[];

    ngOnInit(): void {
        this._sharedData.setTitle('Booking Management');
        this._loadTable();
        this._loadOverviewData();
    }

    private _loadTable() {
        this.bookings$ = this._adminService.getBookings().pipe(
            map(res => res.data ?? [])
        );
    }

    private _buildOverviewCards(data?: IBookingStats): IAdminOverViewCard[] {
        const total = data?.total ?? 0;

        const toPercent = (val: number | undefined) =>
            total > 0 ? `${Math.round(((val ?? 0) / total) * 100)}% of total` : '—';

        return [
            {
                icon: 'fas fa-calendar-alt',
                iconBg: 'bg-blue-100 text-blue-700',
                title: 'Total Bookings',
                value: total,
                subtext: '100% of records'
            },
            {
                icon: 'fas fa-check-circle',
                iconBg: 'bg-green-100 text-green-700',
                title: 'Completed',
                value: data?.completed ?? 0,
                subtext: toPercent(data?.completed)
            },
            {
                icon: 'fas fa-clock',
                iconBg: 'bg-gray-100 text-gray-700',
                title: 'Pending',
                value: data?.pending ?? 0,
                subtext: toPercent(data?.pending)
            },
            {
                icon: 'fas fa-times-circle',
                iconBg: 'bg-red-100 text-red-600',
                title: 'Cancelled',
                value: data?.cancelled ?? 0,
                subtext: toPercent(data?.cancelled)
            },
            {
                icon: 'fas fa-undo-alt',
                iconBg: 'bg-yellow-100 text-yellow-700',
                title: 'Refunded',
                value: data?.refunded ?? 0,
                subtext: toPercent(data?.refunded)
            },
            {
                icon: 'fas fa-credit-card',
                iconBg: 'bg-purple-100 text-purple-700',
                title: 'Unpaid',
                value: data?.unpaid ?? 0,
                subtext: toPercent(data?.unpaid)
            },
        ];
    }


    private _loadOverviewData() {
        this._adminService.getBookingStats().subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    const data = res.data as IBookingStats;
                    this.stats = this._buildOverviewCards(data);
                }
            },
            error: (err) => {
                console.error(err);
            }
        })
    }
}