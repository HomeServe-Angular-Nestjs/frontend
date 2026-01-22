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
        data: { breadcrumb: 'Dashboard' }
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('../../pages/subscription/view-subscription/subscription-view.component')
          .then(c => c.ProviderViewSubscriptionPage),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Subscriptions' }
      },
      {
        path: 'plans',
        loadComponent: () => import('../../pages/subscription/plans/subscription-plan.component')
          .then(c => c.ProviderSubscriptionPlansPage),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Plans' }
      },
      {
        path: 'manage-services',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Manage Services' },
        loadComponent: () => import('../../shared/components/provider/manage-service/manage-service.component')
          .then(c => c.ProviderManageServiceComponent),
      },
      {
        path: 'availability',
        loadComponent: () => import('../../pages/provider/availability/availability.component')
          .then(c => c.ProviderAvailabilityComponent),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Availability' }
      },
      {
        path: 'schedules',
        loadComponent: () => import('../../shared/components/provider/schedules/view-schedules.component')
          .then(c => c.ProviderScheduleView),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Schedules' }
      },
      {
        path: 'profiles',
        canActivate: [AuthGuard],
        component: ProfilesLayoutComponent,
        resolve: {
          provider: ProviderResolver
        },
        data: { breadcrumb: 'Profile' },
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
            data: { breadcrumb: 'Overview' }
          },
          {
            path: 'overview/edit',
            loadComponent: () =>
              import('../../shared/components/provider/profile-overview/edit-overview/provider-edit-overview.component')
                .then(c => c.ProviderEditOverviewComponent),
            data: { breadcrumb: 'Edit Overview' }
          },
          {
            path: 'about',
            loadComponent: () => import('../../shared/components/provider/about-section/profile-about.component')
              .then(c => c.ProviderProfileAboutComponent),
            data: { breadcrumb: 'About' }
          },
          {
            path: 'gallery',
            loadComponent: () => import('../../shared/components/provider/gallery/provider-gallery.component')
              .then(c => c.ProviderGalleryComponent),
            data: { breadcrumb: 'Gallery' }
          }
        ],
      },
      {
        path: 'bookings',
        loadComponent: () => import('../../pages/provider/bookings/bookings.component')
          .then(c => c.ProviderBookingsComponent),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Bookings' }
      },
      {
        path: 'bookings/:id',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../shared/components/provider/bookings/booking-details/booking-details.component')
          .then(c => c.ProviderViewBookingDetailsComponents),
        data: { breadcrumb: 'Booking Details' }
      },
      {
        path: 'chat',
        canActivate: [AuthGuard],
        loadComponent:
          () => import('../../pages/provider/chat/provider-chat.component')
            .then(c => c.ProviderChatComponent),
        data: { breadcrumb: 'Chat' }
      },
      {
        path: 'performance',
        canActivate: [AuthGuard, SubscriptionGuard],
        loadComponent: () => import('../../pages/provider/analytics/performance/performance-page.component')
          .then(c => c.ProviderPerformanceLayoutComponent),
        data: { breadcrumb: 'Performance' }
      },
      {
        path: 'area-analytics',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../pages/provider/analytics/area/area-page.component')
          .then(c => c.ProviderAreaAnalyticsComponent),
        data: { breadcrumb: 'Area Analytics' }
      },
      {
        path: 'revenue-analytics',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../pages/provider/analytics/revenue/revenue-page.component')
          .then(c => c.ProviderRevenueAnalyticsComponent),
        data: { breadcrumb: 'Revenue Analytics' }
      },
      {
        path: 'reviews',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../pages/provider/reviews/review.component')
          .then(c => c.ProviderReviewComponent),
        data: { breadcrumb: 'Reviews' }
      },
      {
        path: 'wallet',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../pages/provider/wallet/wallet.component')
          .then(c => c.ProviderWalletComponent),
        data: { breadcrumb: 'Wallet' }
      },
      {
        path: 'settings',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../pages/provider/settings/settings.component')
          .then(c => c.ProviderSettingsComponent),
        data: { breadcrumb: 'Settings' }
      },
      {
        path: 'notifications',
        canActivate: [AuthGuard],
        loadComponent: () => import('../../pages/provider/notifications/notification.component')
          .then(c => c.ProviderNotificationComponent),
        data: { breadcrumb: 'Notifications' }
      }
    ],
  },
]
