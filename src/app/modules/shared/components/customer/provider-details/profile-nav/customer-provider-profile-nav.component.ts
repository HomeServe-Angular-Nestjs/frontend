import { CommonModule } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

@Component({
    selector: 'app-customer-provider-profile-nav',
    templateUrl: 'customer-provider-profile-nav.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class CustomerProviderProfileNavigationComponent {
    private router = inject(Router);

    @Input({ required: true }) providerId!: string | null;

    items = [
        {
            name: 'About',
            route: ['provider_details', 'about'],
            active: true
        },
        {
            name: 'Services',
            route: ['provider_details', 'services'],
            active: false
        },
        {
            name: 'Reviews',
            route: ['provider_details', 'reviews'],
            active: false
        }
    ]

    changHover(index: number): void {
        this.items = this.items.map((item, i) => ({
            ...item,
            active: i === index
        }));
        this.router.navigate(this.items[index].route, {
            queryParams: { id: this.providerId }
        });
    }

}