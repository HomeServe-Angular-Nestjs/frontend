import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/guards/auth.guard";
import { CustomerLayoutPageComponent } from "../../pages/customer/layout/customer-layout-page.component";
import { ProfileAuthGuard } from "../../../core/guards/profile-auth.guard";

export const customerRoutes: Routes = [
    {
        path: '',
        component: CustomerLayoutPageComponent,
        data: { role: 'customer' },
        children: [
            {
                path: 'landing_page',
                pathMatch: 'full',
                loadComponent: () => import('../../shared/components/customer/landing-page/customer-landing-page.component')
                    .then(c => c.CustomerLandingPageComponent)
            },
            {
                path: 'homepage',
                loadComponent: () => import('../../shared/components/customer/customer-homepage/homepage.component')
                    .then(c => c.CustomerHomepageComponent),
                canActivate: [ProfileAuthGuard, AuthGuard,],
            }
        ],
    },
]
