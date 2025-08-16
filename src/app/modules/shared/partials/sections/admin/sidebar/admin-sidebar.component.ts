import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../../../../../../store/auth/auth.actions';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule],
  templateUrl: './admin-sidebar.component.html',
})
export class AdminSidebarComponent {
  private _router = inject(Router);
  private _store = inject(Store);

  menuItems = [
    {
      name: 'Dashboard',
      icon: 'fa-tachometer-alt',
      route: 'admin/dashboard'
    },
    {
      name: 'User Management',
      icon: 'fa-users',
      subItems: [
        { name: 'Users', route: 'admin/users' },
        { name: 'Ratings & Reviews', route: 'admin/ratings&reviews' },
        // { name: 'Approvals', route: 'admin/approvals' }
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
      route: 'admin/bookings'
    },
    {
      name: 'Revenue & Transactions',
      icon: 'fa-money-bill-wave',
      route: 'admin/transactions'
    },
    // {
    //   name: 'Messaging & Notifications',
    //   icon: 'fa-envelope',
    //   subItems: [
    //     { name: 'Messaging', route: 'admin/messaging' },
    //     { name: 'Notifications', route: 'admin/notifications' }
    //   ]
    // },
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