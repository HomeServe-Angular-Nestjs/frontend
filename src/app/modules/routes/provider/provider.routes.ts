import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/guards/auth.guard";
import { ProviderLayoutComponent } from "../../pages/provider/layout/provider-layout.component";
import { ProfilesLayoutComponent } from "../../pages/provider/profiles/profiles-layout.component";
import { ProviderProfileOverviewLayoutComponent } from "../../shared/components/provider/profile-overview/layout/provider-profile-overview-layout.component";
import { ProviderResolver } from "../../../core/resolver/providerState.resolver";
import { ProfileAuthGuard } from "../../../core/guards/profile-auth.guard";

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
                canActivate: [ProfileAuthGuard, AuthGuard],
            },
            {
                path: 'profiles',
                component: ProfilesLayoutComponent,
                resolve: {
                    provider: ProviderResolver
                },
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
                            .then(c => c.ServiceViewComponent),
                    },
                    {
                        path: 'service_offered/create',
                        loadComponent: () => import('../../shared/components/provider/service-section/service-edit/service-create.component')
                            .then(c => c.ServiceCreateComponent)
                    },
                    {
                        path: 'service_offered/edit/:id',
                        loadComponent: () => import('../../shared/components/provider/service-section/service-edit/service-create.component')
                            .then(c => c.ServiceCreateComponent)
                    },
                    {
                        path: 'schedule',
                        loadComponent: () => import('../../shared/components/provider/schedules/schedule-view/provider-schedule-view.component')
                            .then(c => c.ProviderScheduleViewComponent)
                    },
                    {
                        path: 'schedule_create',
                        loadComponent: () => import('../../shared/components/provider/schedules/schedule-create/provider-schedule-create.component')
                            .then(c => c.ProviderScheduleCreateComponent)
                    }
                ],
                canActivate: [AuthGuard],
            },
            {
                path: 'bookings',
                canActivate: [AuthGuard],
                loadComponent: () => import('../../pages/provider/bookings/bookings.component')
                    .then(c => c.ProviderBookingsComponent)
            },
            {
                path: 'bookings/:id',
                canActivate: [AuthGuard],
                loadComponent: () => import('../../shared/components/provider/bookings/booking-details/booking-details.component')
                    .then(c => c.ProviderViewBookingDetailsComponents)
            }
        ],
    },

] 