import { Routes } from "@angular/router";
import { GuestGuard } from "../../../core/guards/guest.guard";

const verifyEmailRoute = {
    path: 'verify_email',
    loadComponent: () => import('../../shared/UI/forms/change_password/change_password.component')
        .then(c => c.ChangePasswordComponent)
};

export const authRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'signup',
                loadComponent: () => import('../../auth/customer/customer-signup.component')
                    .then(c => c.CustomerSignupComponent),
                canActivate: [GuestGuard]
            },
            {
                path: 'login',
                loadComponent: () => import('../../auth/customer/customer-login.component')
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
                loadComponent: () => import('../../auth/provider/provider-signup.component')
                    .then(c => c.ProviderSignupComponent),
                canActivate: [GuestGuard]
            },
            {
                path: 'login',
                loadComponent: () => import('../../auth/provider/provider-login.component')
                    .then(c => c.ProviderLoginComponent),
                canActivate: [GuestGuard]
            },
            verifyEmailRoute
        ]
    },
]