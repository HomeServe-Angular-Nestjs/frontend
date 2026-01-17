import { Component, inject } from "@angular/core";
import { RouterLink, RouterModule, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import { ICustomer } from "../../../../core/models/user.model";
import { Store } from "@ngrx/store";
import { selectCustomer } from "../../../../store/customer/customer.selector";

@Component({
    selector: 'app-customer-profile-layout',
    standalone: true,
    templateUrl: './layout.component.html',
    imports: [RouterOutlet, CommonModule, RouterLink, RouterModule]
})
export class CustomerProfileLayout {
    private readonly _store = inject(Store);

    customer$: Observable<ICustomer | null> = this._store.select(selectCustomer);

    menuSections = [
        {
            title: 'Account',
            items: [
                { label: 'My Profile', icon: 'fas fa-user-circle', route: '/profile/overview' },
            ],
        },
        {
            title: 'Activity',
            items: [
                { label: 'My Bookings', icon: 'fas fa-calendar-alt', route: '/profile/bookings' },
                { label: 'Saved Providers', icon: 'fas fa-heart', route: '/saved' },
                { label: 'Notifications', icon: 'fas fa-bell', route: '/profile/notifications' },
            ],
        },
        {
            title: 'Settings & Payments',
            items: [
                { label: 'Wallet & Payments', icon: 'fas fa-wallet', route: '/profile/wallet' },
                { label: 'Settings', icon: 'fas fa-cog', route: '/settings' },
            ],
        },
    ];


}
