import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: 'app-customer-provider-profile-nav',
    templateUrl: 'customer-provider-profile-nav.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class CustomerProviderProfileNavigationComponent implements OnInit {
    private router = inject(Router);

    @Input({ required: true }) providerId!: string | null;

    items = [
        {
            name: 'About',
            route: 'about',
            active: false
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
        },
        {
            name: 'Gallery',
            route: 'gallery',
            active: false
        },
    ];

    ngOnInit(): void {
        this.items = this.items.map((item) => ({
            ...item,
            active: item.name === 'About' ? true : false
        }));

        this.router.navigate(['provider_details', this.providerId, this.items[0].route]);
    }

    changHover(index: number): void {
        this.items = this.items.map((item, i) => ({
            ...item,
            active: i === index
        }));
        this.router.navigate(['provider_details', this.providerId, this.items[index].route]);
    }

}