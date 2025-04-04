import { Routes } from "@angular/router";
import { authGuard } from "../../../core/guards/auth.guard";

export const customerRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'homepage',
                loadComponent: () => import('../../shared/components/customer-homepage/homepage.component')
                    .then(c => c.CustomerHomepageComponent),
                canActivate: [authGuard]
            }
        ]
    }
]
