import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/guards/auth.guard";
import { GuestGuard } from "../../../core/guards/guest.guard";

export const adminRoute: Routes = [

    {
        path: 'admin',
        children: [
            {
                path: 'login',
                loadComponent: () => import('../../pages/admin/login/admin.component')
                    .then(c => c.AdminLoginPageComponent),
                canActivate: [GuestGuard]
            },
            {
                path: '',
                canActivate: [AuthGuard],
                loadComponent: () => import('../../pages/admin/layout/admin-layout.component').then(c => c.AdminHomepageComponent),
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'dashboard'
                    },
                    {
                        path: 'dashboard',
                        loadComponent: () => import('../../shared/components/admin/dashboard/layout/admin-dashboard.component').then(c => c.AdminDashboardComponent),
                    },
                    {
                        path: 'users',
                        loadComponent: () => import('../../shared/components/admin/users/user-management.component').then(c => c.UserManagementComponent),
                    },
                    {
                        path: 'approvals',
                        loadComponent: () => import('../../shared/components/admin/approvals/layout/approval-layout.component')
                            .then(c => c.AdminApprovalLayoutComponent)
                    },
                    {
                        path: 'plans',
                        loadComponent: () => import('../../shared/components/admin/subsciptions/current-plans/current-plans.component')
                            .then(c => c.CurrentPlansComponent)
                    },
                    {
                        path: 'subscriptions',
                        loadComponent: () => import('../../shared/components/admin/subsciptions/subscriptions-list/subscriptions-list.component')
                            .then(c => c.AdminSubscriptionsListComponent)
                    },
                    {
                        path: 'bookings',
                        loadComponent: () => import('../../shared/components/admin/bookings/layout/admin-bookings.component')
                            .then(c => c.AdminBookingLayoutComponent)
                    },
                    {
                        path: 'booking_details/:bookingId',
                        loadComponent: () => import('../../shared/components/admin/bookings/booking-details/booking-details.component')
                            .then(c => c.AdminBookingDetailsComponent)
                    },
                    {
                        path: 'reports',
                        loadComponent: () => import('../../shared/components/admin/reports/layout/report-layout.component')
                            .then(c => c.AdminReportsComponent)
                    },
                    {
                        path: 'transactions',
                        loadComponent: () => import('../../shared/components/admin/transactions/admin-transactions.component')
                            .then(c => c.AdminTransactionsComponent)
                    },
                    {
                        path: 'complaints',
                        loadComponent: () => import('../../shared/components/admin/complaints/complaint-list/complaint.component')
                            .then(c => c.AdminComplaintManagementComponent),
                    },
                    {
                        path: 'settings',
                        loadComponent: () => import('../../shared/components/admin/settings/settings.component')
                            .then(c => c.AdminSettingsComponent)
                    },
                    {
                        path: 'categories',
                        loadComponent: () => import('../../shared/components/admin/category/category-layout/category-layout.component')
                            .then(c => c.AdminCategoryLayoutComponent),
                    }
                ]
            },
        ]
    }
];