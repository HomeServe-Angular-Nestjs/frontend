import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../../../../../../store/auth/auth.actions';
import { ButtonComponent } from '../../../../../../UI/button/button.component';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterLink, ButtonComponent],
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
      icon: 'fa-user-shield',
      subItems: [
        { name: 'Users', route: 'admin/users', icon: 'fa-users' },
        { name: 'Ratings & Reviews', route: 'admin/ratings&reviews', icon: 'fa-star' },
        { name: 'Approvals', route: 'admin/approvals', icon: 'fa-circle-check' }
      ]
    },
    {
      name: 'Category Management',
      icon: 'fa-layer-group',
      route: 'admin/categories'
    },
    {
      name: 'Bookings Management',
      icon: 'fa-calendar-check',
      route: 'admin/bookings'
    },
    {
      name: 'Subscriptions & Plans',
      icon: 'fa-id-card',
      subItems: [
        { name: 'Subscriptions', route: 'admin/subscriptions', icon: 'fa-sync-alt' },
        { name: 'Plans', route: 'admin/plans', icon: 'fa-list-alt' }
      ]
    },
    {
      name: 'Revenue & Transactions',
      icon: 'fa-credit-card',
      route: 'admin/transactions'
    },
    {
      name: 'Complaint Management',
      icon: 'fa-bullhorn',
      route: 'admin/complaints'
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