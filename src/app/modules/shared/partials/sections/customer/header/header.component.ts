import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-header',
  imports: [],
  templateUrl: './header.component.html',
})
export class CustomerHeaderComponent {
  cartItemCount: number = 0;
  notificationsCount: number = 3;
  isCartOpen: boolean = false;
  isNotificationsOpen: boolean = false;

  showMobileSearch: boolean = true;

  toggleCartDropdown(): void {
    this.isCartOpen = !this.isCartOpen;
    this.isNotificationsOpen = false;
  }

  toggleNotificationsDropdown(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isCartOpen = false;
  }

  closeAllDropdowns(): void {
    this.isCartOpen = false;
    this.isNotificationsOpen = false;
  }
}
