import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

@Component({
    selector: 'app-customer-provider-profile-nav',
    templateUrl: 'customer-provider-profile-nav.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class CustomerProviderProfileNavigationComponent {
    private router = inject(Router);
    private route = inject(ActivatedRoute)

    @Input({ required: true }) providerId!: string | null;

    items = [
        {
            name: 'About',
            route: 'about',
            active: true
        },
        {
            name: 'Services',
            route: 'services',
            active: false
        },
        {
            name: 'Reviews',
            route: 'reviews',
            active: false
        }
    ]

    changHover(index: number): void {
        this.items = this.items.map((item, i) => ({
            ...item,
            active: i === index
        }));
        this.router.navigate(['provider_details', this.providerId, this.items[index].route]);
    }

}