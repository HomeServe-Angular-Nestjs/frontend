import { Component, computed, EventEmitter, HostListener, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../../../../../../store/auth/auth.actions';
import { providerActions } from '../../../../../../store/provider/provider.action';
import { selectProvider } from '../../../../../../store/provider/provider.selector';
import { take } from 'rxjs';
import { SubscriptionService } from '../../../../../../core/services/subscription.service';
import { FEATURE_REGISTRY } from '../../../../../../core/models/plan.model';

@Component({
  selector: 'app-provider-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './provider-sidebar.component.html',
})
export class ProviderSidebarComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly _subscriptionService = inject(SubscriptionService);

  @Output() collapsedChange = new EventEmitter<'expanded' | 'collapsed' | 'hidden'>();

  providerInfo$ = this.store.select(selectProvider);

  isAnalyticsEnabled = computed(() => {
    const subscription = this._subscriptionService.getSubscription;
    return subscription?.isActive === true &&
      subscription?.features?.[FEATURE_REGISTRY['ANALYTICS_DASHBOARD'].key] === true;
  });

  sidebarMode: 'expanded' | 'collapsed' | 'hidden' = 'expanded';
  isMobileOpen = false;
  innerWidth = window.innerWidth;

  ngOnInit() {
    this.store.select(selectProvider).pipe(take(1)).subscribe((provider) => {
      if (!provider) {
        this.store.dispatch(providerActions.fetchOneProvider());
      }
    });

    this.updateSidebarMode();
  }

  @HostListener('window:resize')
  onResize() {
    this.innerWidth = window.innerWidth;
    this.updateSidebarMode();
  }
  
  updateSidebarMode() {
    // if (this.innerWidth < 768) {
    //   // MOBILE → Hidden drawer
    //   this.sidebarMode = 'hidden';
    //   this.isMobileOpen = false;
    //   this.collapsedChange.emit('hidden');
    //   return;
    // }

    if (this.innerWidth < 1280) {
      // TABLET → Collapsed (icon only)
      this.sidebarMode = 'collapsed';
      this.isMobileOpen = true;
      this.collapsedChange.emit('collapsed');
      return;
    }

    // DESKTOP → Expanded
    this.sidebarMode = 'expanded';
    this.isMobileOpen = true;
    this.collapsedChange.emit('expanded');
  }

  openMobile() {
    if (this.sidebarMode === 'hidden') {
      this.isMobileOpen = true;
    }
  }

  closeMobile() {
    if (this.sidebarMode === 'hidden') {
      this.isMobileOpen = false;
    }
  }

  logout() {
    this.store.dispatch(authActions.logout({ fromInterceptor: false }));
  }

  menuItems = [
    {
      title: 'Operations',
      subItems: [
        {
          name: 'Dashboard',
          icon: 'fas fa-tachometer-alt',
          route: 'dashboard',
          active: true
        },
        {
          name: 'Manage Services',
          icon: 'fas fa-layer-group',
          route: 'manage-services',
          active: false
        },
        {
          name: 'Availability',
          icon: 'fas fa-calendar-days',
          route: 'availability',
          active: false
        },
        {
          name: 'Bookings',
          icon: 'fas fa-calendar-check',
          route: 'bookings',
          active: false
        }
      ]
    },
    {
      title: 'Analytics',
      subItems: [
        {
          name: 'Performance',
          icon: 'fas fa-chart-line',
          route: 'performance',
          active: false
        },
        {
          name: 'Revenue',
          icon: 'fas fa-dollar-sign',
          route: 'revenue-analytics',
          active: false
        },
        {
          name: 'Area Analytics',
          icon: 'fas fa-map-marked-alt',
          route: 'area-analytics',
          active: false
        }
      ]
    },
    {
      title: 'Communication',
      subItems: [
        {
          name: 'Messages',
          icon: 'fas fa-envelope',
          route: 'chat',
          active: false
        },
        {
          name: 'Notifications',
          icon: 'fas fa-bell',
          route: 'notifications',
          active: false
        }
      ]
    },
    {
      title: 'Account & Finance',
      subItems: [
        {
          name: 'Profile',
          icon: 'fas fa-user-circle',
          route: 'profiles',
          active: false
        },
        {
          name: 'Reviews',
          icon: 'fas fa-star',
          route: 'reviews',
          active: false
        },
        {
          name: 'Wallet',
          icon: 'fas fa-wallet',
          route: 'wallet',
          active: false
        },
        {
          name: 'Settings',
          icon: 'fas fa-cog',
          route: 'settings',
          active: false
        }
      ]
    }
  ];

}