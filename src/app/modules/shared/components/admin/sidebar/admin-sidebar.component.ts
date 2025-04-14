import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LoginAuthService } from '../../../../../core/services/login-auth.service';
import { Store } from '@ngrx/store';
import { authActions } from '../../../../../store/actions/auth.actions';
import { AuthState } from '../../../../../store/models/auth.model';
import { loginNavigation } from '../../../../../core/utils/navigation.utils';
import { UserType } from '../../../models/user.model';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule],
  templateUrl: './admin-sidebar.component.html',
  // styleUrls: ['./admin-sidebar.component.scss'],
})
export class AdminSidebarComponent {
  private router = inject(Router);
  private loginService = inject(LoginAuthService);
  private store = inject(Store);

  menuItems = [
    {
      name: 'Dashboard',
      icon: 'fa-tachometer-alt',
      route: 'admin/homepage',
      active: false
    },
    {
      name: 'User Management',
      icon: 'fa-users',
      active: true,
      subItems: [
        { name: 'Users', active: false, route: 'admin/users' },
        { name: 'Ratings & Reviews', active: false, route: 'admin/ratings&reviews' },
        { name: 'Approvals', active: false, route: 'admin/approvals' }
      ]
    },
    {
      name: 'Subscriptions & Plans',
      icon: 'fa-calendar-alt',
      active: false,
      route: 'admin/subscriptions&plans'
    },
    {
      name: 'Bookings Management',
      icon: 'fa-book',
      active: false,
      route: 'bookings'
    },
    {
      name: 'Revenue & Transactions',
      icon: 'fa-money-bill-wave',
      active: false,
      subItems: [
        { name: 'Earnings', active: false, route: 'admin/earnings' },
        { name: 'Wallet', active: true, route: 'admin/wallet' }
      ]
    },
    {
      name: 'Messaging & Notifications',
      icon: 'fa-envelope',
      active: true,
      subItems: [
        { name: 'Messaging', active: true, route: 'admin/messaging' },
        { name: 'Notifications', active: false, route: 'admin/notifications' }
      ]
    },
    {
      name: 'Manage Reports',
      icon: 'fa-chart-bar',
      active: false,
      route: 'admin/reports'
    }
  ];

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  logout() {
    const storage = localStorage.getItem('auth');
    if (!storage) {
      return;
    }
    console.log(storage);
    const parsedStorage = JSON.parse(storage) as AuthState;
    if (!parsedStorage.type) {
      return;
    }
    console.log(parsedStorage.type);
    this.loginService.logout(parsedStorage.type).subscribe({
      next: () => {
        this.store.dispatch(authActions.logout());
        // localStorage.removeItem('auth');
        const url = loginNavigation(parsedStorage.type as UserType);
        this.router.navigate([url]);
      },
      error: (err) => {
        console.error('[ERROR] Logout: ', err);
      }
    });
  }
}
