import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/guards/auth.guard";

export const adminRoute: Routes = [
    {
        path: 'admin',
        loadComponent: () => import('../../pages/admin/homepage/admin-homepage.component').then(c => c.AdminHomepageComponent),
        children: [
            // {
            //     path: '', redirectTo: 'dashboard', pathMatch: 'prefix'
            // },
            {
                path: 'dashboard',
                loadComponent: () => import('../../shared/components/admin/dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('../../shared/components/admin/users/user-management.component').then(c => c.UserManagementComponent),
                canActivate: [AuthGuard]
            }
        ]
    }
]