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
                data: { breadcrumb: 'Admin' },
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'dashboard'
                    },
                    {
                        path: 'dashboard',
                        loadComponent: () => import('../../shared/components/admin/dashboard/layout/admin-dashboard.component').then(c => c.AdminDashboardComponent),
                        data: { breadcrumb: 'Dashboard' }
                    },
                    {
                        path: 'users',
                        loadComponent: () => import('../../shared/components/admin/users/user-management.component').then(c => c.UserManagementComponent),
                        data: { breadcrumb: 'Users' }
                    },
                    {
                        path: 'approvals',
                        loadComponent: () => import('../../shared/components/admin/approvals/layout/approval-layout.component')
                            .then(c => c.AdminApprovalLayoutComponent),
                        data: { breadcrumb: 'Approvals' }
                    },
                    {
                        path: 'plans',
                        loadComponent: () => import('../../shared/components/admin/subsciptions/current-plans/current-plans.component')
                            .then(c => c.CurrentPlansComponent),
                        data: { breadcrumb: 'Plans' }
                    },
                    {
                        path: 'subscriptions',
                        loadComponent: () => import('../../shared/components/admin/subsciptions/subscriptions-list/subscriptions-list.component')
                            .then(c => c.AdminSubscriptionsListComponent),
                        data: { breadcrumb: 'Subscriptions' }
                    },
                    {
                        path: 'bookings',
                        loadComponent: () => import('../../shared/components/admin/bookings/layout/admin-bookings.component')
                            .then(c => c.AdminBookingLayoutComponent),
                        data: { breadcrumb: 'Bookings' }
                    },
                    {
                        path: 'booking_details/:bookingId',
                        loadComponent: () => import('../../shared/components/admin/bookings/booking-details/booking-details.component')
                            .then(c => c.AdminBookingDetailsComponent),
                        data: { breadcrumb: 'Booking Details' }
                    },
                    {
                        path: 'reports',
                        loadComponent: () => import('../../shared/components/admin/reports/layout/report-layout.component')
                            .then(c => c.AdminReportsComponent),
                        data: { breadcrumb: 'Reports' }
                    },
                    {
                        path: 'transactions',
                        loadComponent: () => import('../../shared/components/admin/transactions/admin-transactions.component')
                            .then(c => c.AdminTransactionsComponent),
                        data: { breadcrumb: 'Transactions' }
                    },
                    {
                        path: 'complaints',
                        loadComponent: () => import('../../shared/components/admin/complaints/complaint-list/complaint.component')
                            .then(c => c.AdminComplaintManagementComponent),
                        data: { breadcrumb: 'Complaints' }
                    },
                    {
                        path: 'settings',
                        loadComponent: () => import('../../shared/components/admin/settings/settings.component')
                            .then(c => c.AdminSettingsComponent),
                        data: { breadcrumb: 'Settings' }
                    },
                    {
                        path: 'categories',
                        loadComponent: () => import('../../shared/components/admin/category/category-layout/category-layout.component')
                            .then(c => c.AdminCategoryLayoutComponent),
                        data: { breadcrumb: 'Categories' }
                    }
                ]
            },
        ]
    }
];