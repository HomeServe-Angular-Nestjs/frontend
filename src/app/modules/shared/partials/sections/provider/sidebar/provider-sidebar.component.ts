import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../../../../../../store/auth/auth.actions';

@Component({
  selector: 'app-provider-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './provider-sidebar.component.html',
})
export class ProviderSidebarComponent {
  constructor(private store: Store) { }

  menuItems = [
    {
      title: 'primary navigation',
      subItems: [
        {
          name: 'Dashboard',
          icon: 'fas fa-tachometer-alt',
          route: 'dashboard',
          active: true
        },
        {
          name: 'Manage Services',
          icon: 'fas fa-calendar-check',
          route: 'manage_services',
          active: false
        },
        {
          name: 'Bookings',
          icon: 'fas fa-calendar-check',
          route: 'bookings',
          active: false
        },
        // {
        //   name: 'Schedules',
        //   icon: 'fas fa-calendar-check',
        //   route: 'schedules',
        //   active: false
        // },
      ]
    },
    {
      title: 'analytics',
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
      title: 'account management',
      subItems: [
        {
          name: 'Profile',
          icon: 'fas fa-user-circle',
          route: 'profiles',
          active: false
        },
        {
          name: 'Messages',
          icon: 'fas fa-envelope',
          route: 'chat',
          active: false
        },
        {
          name: 'Notifications',
          icon: 'fas fa-bell',
          route: '',
          active: false
        }
      ]
    },
    {
      title: 'Business Tools',
      subItems: [
        {
          name: 'Reviews',
          icon: 'fas fa-star',
          route: '',
          active: false
        },
        {
          name: 'Earnings',
          icon: 'fas fa-wallet',
          route: '',
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

  logout() {
    this.store.dispatch(authActions.logout({ fromInterceptor: false }));
  }
}
