import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/guards/auth.guard";
import { CustomerLayoutPageComponent } from "../../pages/customer/layout/customer-layout-page.component";
import { ProfileAuthGuard } from "../../../core/guards/profile-auth.guard";
import { CustomerProviderProfileLayoutComponent } from "../../pages/customer/provider-details-page/customer-provider-profile-layout.component";
import { CustomerProfileLayout } from "../../pages/customer/profile-layout/layout.component";

export const customerRoutes: Routes = [
    {
        path: '',
        component: CustomerLayoutPageComponent,
        data: { role: 'customer' },
        children: [
            {
                path: '',
                pathMatch: "full",
                redirectTo: 'homePage'
            },
            {
                path: 'landing_page',
                pathMatch: 'full',
                loadComponent: () => import('../../pages/customer/landing-page/customer-landing-page.component')
                    .then(c => c.CustomerLandingPageComponent)
            },
            {
                path: 'homepage',
                loadComponent: () => import('../../pages/customer/customer-homepage/homepage.component')
                    .then(c => c.CustomerHomepageComponent),
                canActivate: [ProfileAuthGuard, AuthGuard],
            },
            {
                path: 'view_providers',
                loadComponent: () => import('../../pages/customer/view-providers/customer-view-providers.component')
                    .then(c => c.CustomerViewProvidersComponent),
                canActivate: [AuthGuard]
            },
            {
                path: 'provider_details/:id',
                component: CustomerProviderProfileLayoutComponent,
                canActivate: [AuthGuard],
                children: [
                    {
                        path: '',
                        pathMatch: "full",
                        redirectTo: 'about'
                    },
                    {
                        path: 'about',
                        loadComponent: () => import('../../shared/components/customer/provider-details/profile-about/customer-provider-profile-about.component')
                            .then(c => c.CustomerProviderProfileAboutComponent)
                    },
                    {
                        path: 'services',
                        loadComponent: () => import('../../shared/components/customer/provider-details/profile-services/customer-provider-profile-services.component')
                            .then(c => c.CustomerProviderProfileServicesComponent)
                    },
                    {
                        path: 'reviews',
                        loadComponent: () => import('../../shared/components/customer/provider-details/profile-reviews/layout/customer-review-layout.component')
                            .then(c => c.CustomerReviewLayoutComponent)
                    },
                    {
                        path: 'gallery',
                        loadComponent: () => import('../../shared/components/customer/provider-details/profile-gallery/profile-gallery.component')
                            .then(c => c.CustomerProviderGalleryComponent)
                    },
                ]
            },
            {
                path: 'pick_a_service/:id',
                loadComponent: () => import('../../pages/customer/booking-1-pick-service/customer-pick-a-service.component')
                    .then(c => c.CustomerPickAServiceComponent),
                canActivate: [AuthGuard]
            },
            {
                path: 'schedule_service/:id',
                loadComponent: () => import('../../pages/customer/booking-2-schedule/customer-service-schedule.component')
                    .then(c => c.CustomerServiceScheduleComponent),
                canActivate: [AuthGuard]
            },
            {
                path: 'profile',
                component: CustomerProfileLayout,
                canActivate: [AuthGuard],
                children: [
                    {
                        path: '',
                        pathMatch: "full",
                        redirectTo: 'overview'
                    },
                    {
                        path: 'overview',
                        loadComponent: () => import('../../shared/components/customer/profile/overview/profile-overview.component')
                            .then(c => c.CustomerProfileOverviewComponent)
                    },
                    {
                        path: 'overview/edit',
                        loadComponent: () => import('../../shared/components/customer/profile/overview-edit/profile-overview-edit.component')
                            .then(c => c.CustomerProfileOverviewEditComponent)
                    },
                    {
                        path: 'bookings',
                        loadComponent: () => import('../../shared/components/customer/bookings/order-history/booking-lists.component')
                            .then(c => c.CustomerBookingListsComponent)
                    },
                    {
                        path: 'bookings/:id',
                        loadComponent: () => import('../../shared/components/customer/bookings/view-details/booking-details.component')
                            .then(c => c.CustomerViewBookingDetailsComponent)
                    },
                ],
            },
        ],
    },
    {
        path: 'chat',
        loadComponent: () => import('../../pages/customer/chat/customer-chat.component')
            .then(c => c.CustomerChatComponent),
        canActivate: [AuthGuard]
    }
]
