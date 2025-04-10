import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/guards/auth.guard";

export const customerRoutes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        data: { role: 'customer' },
        children: [
            {
                path: 'homepage',
                loadComponent: () => import('../../shared/components/customer/customer-homepage/homepage.component')
                    .then(c => c.CustomerHomepageComponent),
            }
        ],
    },
]
