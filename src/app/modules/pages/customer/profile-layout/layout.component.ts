import { Component, inject, OnInit } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { map, Observable } from "rxjs";
import { ICustomer } from "../../../../core/models/user.model";
import { Store } from "@ngrx/store";
import { selectCustomer } from "../../../../store/customer/customer.selector";

@Component({
    selector: 'app-customer-profile-layout',
    templateUrl: './layout.component.html',
    imports: [RouterOutlet, CommonModule, RouterLink]
})
export class CustomerProfileLayout {
    private readonly _store = inject(Store);

    menuSections = [
        {
            title: 'Profile & Account',
            items: [
                { label: 'Profile Overview', icon: 'fas fa-chart-line', route: '/profile/overview' },
                { label: 'Edit Profile', icon: 'fas fa-edit', route: '/profile/overview/edit' },
            ],
        },
        {
            title: 'Service & Bookings',
            items: [
                { label: 'My Bookings', icon: 'fas fa-calendar-alt', route: '/profile/bookings' },
                { label: 'Saved Providers', icon: 'fas fa-heart', route: '/saved' },
                { label: 'Reviews & Ratings', icon: 'fas fa-star', route: '/reviews' },
            ],
        },
        {
            title: 'Payments & Settings',
            items: [
                { label: 'Wallet & Payments', icon: 'fas fa-wallet', route: '/wallet' },
                { label: 'Settings', icon: 'fas fa-cog', route: '/settings' },
                { label: 'Logout', icon: 'fas fa-sign-out-alt', route: '/logout', logout: true },
            ],
        },
    ];

    customer$: Observable<ICustomer | null> = this._store.select(selectCustomer);
}
