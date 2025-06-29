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
                loadComponent: () => import('../../pages/admin/homepage/admin-homepage.component').then(c => c.AdminHomepageComponent),
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'dashboard'
                    },
                    {
                        path: 'dashboard',
                        loadComponent: () => import('../../shared/components/admin/dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'users',
                        loadComponent: () => import('../../shared/components/admin/users/user-management.component').then(c => c.UserManagementComponent),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'approvals',
                        loadComponent: () => import('../../shared/components/admin/approvals/layout/approval-layout.component')
                            .then(c => c.AdminApprovalLayoutComponent)
                    }
                ]
            },
        ]
    }
];