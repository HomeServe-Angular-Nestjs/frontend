import { Routes } from "@angular/router";
import { GuestGuard } from "../../../core/guards/guest.guard";

const verifyEmailRoute = {
    path: 'verify_email',
    loadComponent: () => import('../../shared/partials/auth/change_password/change_password.component')
        .then(c => c.ChangePasswordComponent)
};

export const authRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'signup',
                loadComponent: () => import('../../pages/customer/signup-page/customer-signup.component')
                    .then(c => c.CustomerSignupComponent),
                canActivate: [GuestGuard]
            },
            {
                path: 'login',
                loadComponent: () => import('../../pages/customer/login-page/customer-login.component')
                    .then(c => c.CustomerLoginComponent),
                canActivate: [GuestGuard]
            },
            verifyEmailRoute
        ]
    },
    {
        path: 'provider',
        children: [
            {
                path: 'signup',
                loadComponent: () => import('../../pages/provider/signup/provider-signup.component')
                    .then(c => c.ProviderSignupComponent),
                canActivate: [GuestGuard]
            },
            {
                path: 'login',
                loadComponent: () => import('../../pages/provider/login/provider-login.component')
                    .then(c => c.ProviderLoginComponent),
                canActivate: [GuestGuard]
            },
            verifyEmailRoute
        ]
    },
    {
        path: 'admin',
        children: [
            {
                path: 'login',
                loadComponent: () => import('../../pages/admin/login/admin.component')
                    .then(c => c.AdminLoginPageComponent),
                canActivate: [GuestGuard]
            }
        ]
    }
]