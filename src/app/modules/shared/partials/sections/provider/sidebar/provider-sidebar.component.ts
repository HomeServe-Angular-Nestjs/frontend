import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LoginAuthService } from '../../../../../../core/services/login-auth.service';
import { NotificationService } from '../../../../../../core/services/public/notification.service';
import { Store } from '@ngrx/store';
import { authActions } from '../../../../../../store/auth/auth.actions';

@Component({
  selector: 'app-provider-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './provider-sidebar.component.html',
  // styleUrl: './provider-sidebar.component.scss',
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
          name: 'Bookings',
          icon: 'fas fa-calendar-check',
          route: '',
          active: false
        }
      ]
    },
    {
      title: 'analytics',
      subItems: [
        {
          name: 'Performance',
          icon: 'fas fa-chart-line',
          route: '',
          active: false
        },
        {
          name: 'Revenue',
          icon: 'fas fa-dollar-sign',
          route: '',
          active: false
        },
        {
          name: 'Area Analytics',
          icon: 'fas fa-map-marked-alt',
          route: '',
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
          name: 'messages',
          icon: 'fas fa-envelope',
          route: '',
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
          route: '',
          active: false
        }
      ]
    }
  ];

  logout() {
    this.store.dispatch(authActions.logout({ userType: 'provider' }));
  }
}
