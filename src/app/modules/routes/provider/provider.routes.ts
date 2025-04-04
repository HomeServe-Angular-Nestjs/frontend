import { Routes } from "@angular/router";
import { authGuard } from "../../../core/guards/auth.guard";

export const providerRoutes: Routes = [
    {
        path: 'provider',
        children: [
            {
                path: 'homepage',
                loadComponent: () => import('../../shared/components/provider-homepage/provider-homepage.component')
                    .then(c => c.ProviderHomepageComponent),
                canActivate: [authGuard]
            }
        ]
    }
] 