import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/guards/auth.guard";
import { ProviderLayoutComponent } from "../../pages/provider/layout/provider-layout.component";
import { ProfilesLayoutComponent } from "../../shared/components/provider/profiles/layout/profiles-layout.component";

export const providerRoutes: Routes = [
    {
        path: 'provider',
        component: ProviderLayoutComponent,
        data: { role: 'provider' },
        children: [
            {
                path: 'homepage',
                loadComponent: () => import('../../shared/components/provider/provider-homepage/provider-homepage.component')
                    .then(c => c.ProviderHomepageComponent),
                canActivate: [AuthGuard],
            },
            {
                path: 'profiles',
                component: ProfilesLayoutComponent,
                children: [
                    {
                        path: 'service_offered',
                        loadComponent: () => import('../../shared/components/provider/profiles/service-section/service-view/service-view.component')
                            .then(c => c.ServiceViewComponent)
                    },
                    {
                        path: 'create_service',
                        loadComponent: () => import('../../shared/components/provider/profiles/service-section/service-edit/service-create.component')
                            .then(c => c.ServiceCreateComponent)
                    }
                ],
                canActivate: [AuthGuard],
            }
        ],
    },
] 