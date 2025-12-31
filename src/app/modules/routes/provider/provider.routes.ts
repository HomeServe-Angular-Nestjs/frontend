import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/guards/auth.guard";
import { ProviderLayoutComponent } from "../../pages/provider/layout/provider-layout.component";
import { ProfilesLayoutComponent } from "../../pages/provider/profiles/profiles-layout.component";
import { ProviderResolver } from "../../../core/resolver/providerState.resolver";
import { ProfileAuthGuard } from "../../../core/guards/profile-auth.guard";
import { SubscriptionGuard } from "../../../core/guards/subscription-guard.guard";

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
        canActivate: [ProfileAuthGuard, AuthGuard, SubscriptionGuard],
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('../../pages/subscription/view-subscription/subscription-view.component')
          .then(c => c.ProviderViewSubscriptionPage),
        canActivate: [AuthGuard],
      },
      {
        path: 'plans',
        loadComponent: () => import('../../pages/subscription/plans/subscription-plan.component')
          .then(c => c.ProviderSubscriptionPlansPage),
        canActivate: [AuthGuard],
      },
      {
        path: 'manage-services',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('../../shared/components/provider/manage-service/manage-service.component')
              .then(c => c.ProviderManageServiceComponent),
          },
        ]
      },
      {
        path: 'manage_services',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('../../shared/components/provider/service-section/service-view/service-view.component')
              .then(c => c.ServiceViewComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('../../shared/components/provider/service-section/service-edit/service-create.component')
              .then(c => c.ServiceCreateComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('../../shared/components/provider/service-section/service-edit/service-create.component')
              .then(c => c.ServiceCreateComponent)
          },
        ]
      },
      {
        path: 'availability',
        loadComponent: () => import('../../pages/provider/availability/availability.component')
          .then(c => c.ProviderAvailabilityComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'schedules',
        loadComponent: () => import('../../shared/components/provider/schedules/view-schedules.component')
          .then(c => c.ProviderScheduleView),
        canActivate: [AuthGuard],

      },
      {
        path: 'profiles',
        canActivate: [AuthGuard],
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
            loadComponent: () =>
              import('../../shared/components/provider/profile-overview/view-overview/provider-profile-overview.component')
                .then(c => c.ProviderProfileOverviewComponent),
          },
          {
            path: 'overview/edit',
            loadComponent: () =>
              import('../../shared/components/provider/profile-overview/edit-overview/provider-edit-overview.component')
                .then(c => c.ProviderEditOverviewComponent),
          },
          {
            path: 'about',
            loadComponent: () => import('../../shared/components/provider/about-section/profile-about.component')
              .then(c => c.ProviderProfileAboutComponent)
          },
          {
            path: 'rules',
            loadComponent: () => import('../../shared/components/provider/slot-management/layout/slot-management-layout.component')
              .then(c => c.ProviderSlotManagementComponent)
          },
          {
            path: 'schedule_create',
            loadComponent: () => import('../../shared/components/provider/slot-management/layout/slot-management-layout.component')
              .then(c => c.ProviderSlotManagementComponent)
          },
          {
            path: 'gallery',
            loadComponent: () => import('../../shared/components/provider/gallery/provider-gallery.component')
              .then(c => c.ProviderGalleryComponent),
          }
        ],
      },
      {
        path: 'bookings',
        loadComponent: () => import('../../pages/provider/bookings/bookings.component')
          .then(c => c.ProviderBookingsComponent),
        canActivate: [AuthGuard],

      },
      {
        path: 'bookings/:id',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../shared/components/provider/bookings/booking-details/booking-details.component')
          .then(c => c.ProviderViewBookingDetailsComponents)
      },
      {
        path: 'chat',
        canActivate: [AuthGuard],
        loadComponent:
          () => import('../../pages/provider/chat/provider-chat.component')
            .then(c => c.ProviderChatComponent)
      },
      {
        path: 'performance',
        canActivate: [AuthGuard, SubscriptionGuard],
        loadComponent: () => import('../../pages/provider/analytics/performance/performance-page.component')
          .then(c => c.ProviderPerformanceLayoutComponent)
      },
      {
        path: 'area-analytics',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../pages/provider/analytics/area/area-page.component')
          .then(c => c.ProviderAreaAnalyticsComponent)
      },
      {
        path: 'revenue-analytics',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../pages/provider/analytics/revenue/revenue-page.component')
          .then(c => c.ProviderRevenueAnalyticsComponent)
      },
      {
        path: 'reviews',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../pages/provider/reviews/review.component')
          .then(c => c.ProviderReviewComponent)
      },
      {
        path: 'wallet',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../pages/provider/wallet/wallet.component')
          .then(c => c.ProviderWalletComponent)
      },
      {
        path: 'settings',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../pages/provider/settings/settings.component')
          .then(c => c.ProviderSettingsComponent)
      }
    ],
  },

]
