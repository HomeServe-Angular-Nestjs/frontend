import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

@Component({
    selector: 'app-profile-breadcrumbs',
    templateUrl: './profile-breadcrumbs.component.html',
    imports: [CommonModule, RouterLink]
})
export class ProfileBreadcrumbsComponent implements OnInit {
    private _router = inject(Router);

    crumbs = [
        {
            name: 'Profile Overview',
            icon: 'fa-user-circle',
            active: false,
            route: 'overview'
        },
        {
            name: 'About Section',
            icon: 'fa-info-circle',
            active: false,
            route: 'about'
        },
        {
            name: 'Service Offered',
            icon: 'fa-tools',
            active: false,
            route: 'service_offered'
        },
        {
            name: 'Work Scheduled',
            icon: 'fa-clock',
            active: false,
            route: 'schedule'
        },
        {
            name: 'Gallery',
            icon: 'fa-images',
            active: false,
            route: 'gallery'
        },
    ];

    ngOnInit() {
        const segments = this._router.url.split('?')[0].split('/');
        this.crumbs.forEach(item => {
            if (item.route && segments.includes(item.route)) {
                this.changeStatus(item.name);
            }
        });
    }

    changeStatus(name: string): void {
        this.crumbs = this.crumbs.map((item) => ({
            ...item,
            active: name === item.name
        }));
    }
}