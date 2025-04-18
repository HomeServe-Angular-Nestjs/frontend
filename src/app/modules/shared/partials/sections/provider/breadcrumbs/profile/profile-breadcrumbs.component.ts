import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    selector: 'app-profile-breadcrumbs',
    templateUrl: './profile-breadcrumbs.component.html',
    imports: [CommonModule]
})
export class ProfileBreadcrumbsComponent {

    crumbs = [
        {
            name: 'Profile Overview',
            icon: 'fa-user-circle',
            active: true,
            route: ''
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
            route: 'provider/profiles/service_offered'
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