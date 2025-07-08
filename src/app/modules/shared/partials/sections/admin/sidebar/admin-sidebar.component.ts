import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoginAuthService } from '../../../../../../core/services/login-auth.service';
import { AuthState } from '../../../../../../core/models/auth.model';
import { authActions } from '../../../../../../store/auth/auth.actions';
import { UserType } from '../../../../models/user.model';
import { loginNavigation } from '../../../../../../core/utils/navigation.utils';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule],
  templateUrl: './admin-sidebar.component.html',
  // styleUrls: ['./admin-sidebar.component.scss'],
})
export class AdminSidebarComponent {
  private _router = inject(Router);
  private _store = inject(Store);

  menuItems = [
    {
      name: 'Dashboard',
      icon: 'fa-tachometer-alt',
      route: 'admin/homepage'
    },
    {
      name: 'User Management',
      icon: 'fa-users',
      subItems: [
        { name: 'Users', route: 'admin/users' },
        { name: 'Ratings & Reviews', route: 'admin/ratings&reviews' },
        { name: 'Approvals', route: 'admin/approvals' }
      ]
    },
    {
      name: 'Subscriptions & Plans',
      icon: 'fa-calendar-alt',
      route: 'admin/subscriptions'
    },
    {
      name: 'Bookings Management',
      icon: 'fa-book',
      route: 'bookings'
    },
    {
      name: 'Revenue & Transactions',
      icon: 'fa-money-bill-wave',
      subItems: [
        { name: 'Earnings', route: 'admin/earnings' },
        { name: 'Wallet', route: 'admin/wallet' }
      ]
    },
    {
      name: 'Messaging & Notifications',
      icon: 'fa-envelope',
      subItems: [
        { name: 'Messaging', route: 'admin/messaging' },
        { name: 'Notifications', route: 'admin/notifications' }
      ]
    },
    {
      name: 'Manage Reports',
      icon: 'fa-chart-bar',
      route: 'admin/reports'
    }
  ];

  openedMenu: string | null = null;

  navigateTo(route: string): void {
    this._router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this._router.isActive(route, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  toggleMenu(name: string): void {
    this.openedMenu = this.openedMenu === name ? null : name;
  }

  logout() {
    this._store.dispatch(authActions.logout({ fromInterceptor: false }));
  }
}