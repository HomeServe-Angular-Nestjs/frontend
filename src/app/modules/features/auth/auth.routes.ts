import { Routes } from "@angular/router";

export const authRoutes: Routes = [
    {
        path: 'signup',
        children: [
            {
                path: '',
                loadComponent: () => import('../../auth/signup/customer/customer-signup.component')
                    .then(c => c.CustomerSignupComponent)
            },
            {
                path: 'provider',
                loadComponent: () => import('../../auth/signup/provider/provider-signup.component')
                    .then(c => c.ProviderSignupComponent)
            },
        ]
    }
]