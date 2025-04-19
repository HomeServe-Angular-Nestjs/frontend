import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-provider-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './provider-sidebar.component.html',
  // styleUrl: './provider-sidebar.component.scss',
})
export class ProviderSidebarComponent {
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
  ]
}
