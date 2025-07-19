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
            ],
        },
    ];
}
