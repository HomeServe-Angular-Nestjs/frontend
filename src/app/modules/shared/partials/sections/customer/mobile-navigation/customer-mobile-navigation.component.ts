import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectCheckStatus } from '../../../../../../store/auth/auth.selector';

@Component({
  selector: 'app-customer-mobile-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './customer-mobile-navigation.component.html',
})
export class CustomerMobileNavigationComponent {
  private readonly _store = inject(Store);
  readonly userStatus = toSignal(this._store.select(selectCheckStatus));

  isMoreMenuOpen = false;

  readonly primaryItems = [
    { label: 'Home', icon: 'fas fa-home', route: '/homepage', exact: true },
    { label: 'Bookings', icon: 'fas fa-calendar-alt', route: '/profile/bookings', exact: false },
    { label: 'Cart', icon: 'fas fa-shopping-cart', route: '/cart', exact: true },
    { label: 'Profile', icon: 'fas fa-user-circle', route: '/profile', exact: false },
  ];

  readonly moreItems = [
    { label: 'Saved Providers', icon: 'fas fa-heart', route: '/profile/saved' },
    { label: 'Notifications', icon: 'fas fa-bell', route: '/profile/notifications' },
    { label: 'Wallet & Payments', icon: 'fas fa-wallet', route: '/profile/wallet' },
    { label: 'Messages', icon: 'fas fa-comment', route: '/chat' },
  ];

  toggleMoreMenu(): void {
    this.isMoreMenuOpen = !this.isMoreMenuOpen;
  }

  closeMoreMenu(): void {
    this.isMoreMenuOpen = false;
  }
}
