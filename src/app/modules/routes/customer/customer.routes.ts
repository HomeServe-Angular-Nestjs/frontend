import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/guards/auth.guard";
import { CustomerLayoutPageComponent } from "../../pages/customer/layout/customer-layout-page.component";
import { ProfileAuthGuard } from "../../../core/guards/profile-auth.guard";
import { CustomerProviderProfileLayoutComponent } from "../../pages/customer/provider-details-page/customer-provider-profile-layout.component";
import { CustomerProfileLayout } from "../../pages/customer/profile-layout/layout.component";
import { GuestGuard } from "../../../core/guards/guest.guard";

export const customerRoutes: Routes = [
  {
    path: 'landing_page',
    pathMatch: 'full',
    loadComponent: () => import('../../pages/customer/landing-page/customer-landing-page.component')
      .then(c => c.CustomerLandingPageComponent),
    canActivate: [GuestGuard]
  },
  {
    path: '',
    component: CustomerLayoutPageComponent,
    data: { role: 'customer' },
    children: [
      {
        path: 'homepage',
        loadComponent: () => import('../../pages/customer/customer-homepage/homepage.component')
          .then(c => c.CustomerHomepageComponent),
        canActivate: [ProfileAuthGuard, AuthGuard],
        data: { breadcrumb: '' }
      },
      {
        path: 'view_providers',
        loadComponent: () => import('../../pages/customer/view-providers/customer-view-providers.component')
          .then(c => c.CustomerViewProvidersComponent),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Service Providers' }
      },
      {
        path: 'provider_details/:id',
        component: CustomerProviderProfileLayoutComponent,
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Provider Details' },
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
            loadComponent: () => import('../../shared/components/customer/provider-details/profile-reviews/review-list.component')
              .then(c => c.CustomerReviewListComponent)
          },
          {
            path: 'gallery',
            loadComponent: () => import('../../shared/components/customer/provider-details/profile-gallery/profile-gallery.component')
              .then(c => c.CustomerProviderGalleryComponent)
          },
        ]
      },
      {
        path: 'cart',
        loadComponent: () => import('../../pages/customer/cart/cart.component')
          .then(c => c.CartComponent),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Cart' }
      },
      {
        path: 'schedule_service/:id',
        loadComponent: () => import('../../pages/customer/booking-2-schedule/customer-service-schedule.component')
          .then(c => c.CustomerServiceScheduleComponent),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Schedule Service' }
      },
      {
        path: 'profile',
        component: CustomerProfileLayout,
        canActivate: [AuthGuard],
        data: { breadcrumb: 'My Profile' },
        children: [
          {
            path: '',
            pathMatch: "full",
            redirectTo: 'overview'
          },
          {
            path: 'overview',
            loadComponent: () => import('../../shared/components/customer/profile/overview/profile-overview.component')
              .then(c => c.CustomerProfileOverviewComponent),
            data: { breadcrumb: 'Overview' }
          },

          {
            path: 'bookings',
            loadComponent: () => import('../../shared/components/customer/bookings/order-history/booking-lists.component')
              .then(c => c.CustomerBookingListsComponent),
            data: { breadcrumb: 'My Bookings' }
          },
          {
            path: 'bookings/:id',
            loadComponent: () => import('../../shared/components/customer/bookings/view-details/booking-details.component')
              .then(c => c.CustomerViewBookingDetailsComponent),
            data: { breadcrumb: 'Booking Details' }
          },
          {
            path: 'wallet',
            loadComponent: () => import('../../shared/components/customer/wallet/customer-wallet.component')
              .then(c => c.CustomerWalletComponent),
            data: { breadcrumb: 'My Wallet' }
          },
          {
            path: 'notifications',
            loadComponent: () => import('../../shared/components/customer/notifications/notifications.component')
              .then(c => c.CustomerNotificationComponent),
            data: { breadcrumb: 'Notifications' }
          }
        ],
      },
    ],
  },
  {
    path: 'chat',
    loadComponent: () => import('../../pages/customer/chat/customer-chat.component')
      .then(c => c.CustomerChatComponent),
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Chat' }
  },
  {
    path: 'plans',
    loadComponent: () => import('../../pages/subscription/plans/subscription-plan.component')
      .then(c => c.ProviderSubscriptionPlansPage),
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Subscription Plans' }
  },
  {
    path: 'subscription',
    loadComponent: () => import('../../pages/subscription/view-subscription/subscription-view.component')
      .then(c => c.ProviderViewSubscriptionPage),
    canActivate: [AuthGuard],
    data: { breadcrumb: 'My Subscription' }
  },
]
