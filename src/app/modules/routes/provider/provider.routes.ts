import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/guards/auth.guard";

export const providerRoutes: Routes = [
    {
        path: 'provider',
        canActivate: [AuthGuard],
        data: { role: 'provider' },
        children: [
            {
                path: 'homepage',
                loadComponent: () => import('../../shared/components/provider/provider-homepage/provider-homepage.component')
                    .then(c => c.ProviderHomepageComponent),
            }
        ]
    }
] 