import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { IAdminOverViewCard, OverviewCardComponent } from "../../../../partials/sections/admin/overview-card/admin-overview-card.component";
import { AdminService } from "../../../../../../core/services/admin.service";
import { filter, map } from "rxjs";

@Component({
    selector: 'app-admin-dashboard-overview',
    templateUrl: './dashboard-overview.component.html',
    imports: [CommonModule, OverviewCardComponent]
})
export class AdminDashboardOverviewComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    overviewStats: IAdminOverViewCard[] = [
        {
            title: 'Total Users',
            value: 0,
            icon: 'fas fa-users',
            iconBg: 'bg-indigo-100 text-indigo-700',
            subtext: 'All registered customers',
        },
        {
            title: 'Active Providers',
            value: 0,
            icon: 'fas fa-briefcase',
            iconBg: 'bg-green-100 text-green-700',
            subtext: 'Verified and currently active',
        },
        {
            title: 'Pending Verifications',
            value: 0,
            icon: 'fas fa-user-clock',
            iconBg: 'bg-yellow-100 text-yellow-700',
            subtext: 'Awaiting admin approval',
        },
        {
            title: 'Bookings Today',
            value: 0,
            icon: 'fas fa-calendar-check',
            iconBg: 'bg-blue-100 text-blue-700',
            subtext: 'Confirmed for today',
        },
        {
            title: 'New Users This Week',
            value: 0,
            icon: 'fas fa-user-plus',
            iconBg: 'bg-purple-100 text-purple-700',
            subtext: 'Compared to last week',
        },
        {
            title: 'Weekly Revenue',
            value: `₹ ${0}`,
            icon: 'fas fa-indian-rupee-sign',
            iconBg: 'bg-red-100 text-red-700',
            subtext: 'Past 7 days',
        }
    ];

    ngOnInit(): void {

        this._adminService.getDashboardOverviewData().pipe(
            map(res => res.data),
            filter(Boolean)
        ).subscribe({
            next: (data) => {
                if (data) {
                    const keyMap = new Map<string, string>([
                        ['totalUsers', 'Total Users'],
                        ['activeProviders', 'Active Providers'],
                        ['pendingVerifications', 'Pending Verifications'],
                        ['todaysBookings', 'Bookings Today'],
                        ['newUsersThisWeek', 'New Users This Week'],
                        ['weeklyTransactions', 'Weekly Revenue']
                    ]);

                    for (const [key, label] of keyMap.entries()) {
                        const stat = this.overviewStats.find(s => s.title === label);

                        if (stat) {
                            if (key === 'weeklyTransactions') {
                                stat.value = `₹ ${data[key] ?? 0} `;
                            } else {
                                stat.value = data[key];
                            }
                        }
                    }
                }
            }
        })
    }
}