import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/guards/auth.guard";
import { ProviderLayoutComponent } from "../../pages/provider/layout/provider-layout.component";
import { ProfilesLayoutComponent } from "../../pages/provider/profiles/profiles-layout.component";
import { ProviderProfileOverviewLayoutComponent } from "../../shared/components/provider/profile-overview/layout/provider-profile-overview-layout.component";

export const providerRoutes: Routes = [
    {
        path: 'provider',
        component: ProviderLayoutComponent,
        data: { role: 'provider' },
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('../../pages/provider/provider-homepage/provider-homepage.component')
                    .then(c => c.ProviderHomepageComponent),
                canActivate: [AuthGuard],
            },
            {
                path: 'profiles',
                component: ProfilesLayoutComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'overview'
                    },
                    {
                        path: 'overview',
                        component: ProviderProfileOverviewLayoutComponent,
                        children: [
                            {
                                path: '',
                                loadComponent: () => import('../../shared/components/provider/profile-overview/view-overview/provider-profile-overview.component')
                                    .then(c => c.ProviderProfileOverviewComponent),
                            },
                            {
                                path: 'edit',
                                loadComponent: () => import('../../shared/components/provider/profile-overview/edit-overview/provider-edit-overview.component')
                                    .then(c => c.ProviderEditOverviewComponent)
                            }
                        ]
                    },
                    {
                        path: 'service_offered',
                        loadComponent: () => import('../../shared/components/provider/service-section/service-view/service-view.component')
                            .then(c => c.ServiceViewComponent)
                    },
                    {
                        path: 'create_service',
                        loadComponent: () => import('../../shared/components/provider/service-section/service-edit/service-create.component')
                            .then(c => c.ServiceCreateComponent)
                    },
                ],
                canActivate: [AuthGuard],
            }
        ],
    },
] 