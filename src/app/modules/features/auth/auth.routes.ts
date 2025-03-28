import { Routes } from "@angular/router";

export const authRoutes: Routes = [
    {
        path: 'signup',
        children: [
            {
                path: '',
                loadComponent: () => import('../../auth/customer/customer-signup.component')
                    .then(c => c.CustomerSignupComponent)
            },
            {
                path: 'provider',
                loadComponent: () => import('../../auth/provider/provider-signup.component')
                    .then(c => c.ProviderSignupComponent)
            },
        ]
    },
    {
        path: 'login',
        children: [
            {
                path: '',
                loadComponent: () => import('../../auth/customer/customer-login.component')
                    .then(c => c.CustomerLoginComponent)
            },
            {
                path: 'provider',
                loadComponent: () => import('../../auth/provider/provider-login.component')
                    .then(c => c.ProviderLoginComponent)
            }
        ]
    }
]