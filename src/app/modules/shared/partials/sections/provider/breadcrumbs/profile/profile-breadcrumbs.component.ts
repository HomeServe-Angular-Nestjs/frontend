import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-profile-breadcrumbs',
    templateUrl: './profile-breadcrumbs.component.html',
    imports: [CommonModule, RouterLink]
})
export class ProfileBreadcrumbsComponent {

    crumbs = [
        {
            name: 'Profile Overview',
            icon: 'fa-user-circle',
            active: true,
            route: 'overview'
        },
        {
            name: 'About Section',
            icon: 'fa-info-circle',
            active: false,
            route: ''
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
            route: ''
        },
        {
            name: 'Gallery',
            icon: 'fa-images',
            active: false,
            route: ''
        },
    ]
}