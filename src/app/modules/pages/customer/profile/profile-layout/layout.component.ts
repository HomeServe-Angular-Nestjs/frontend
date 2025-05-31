import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ProfileSideNavComponent } from "../profile-side-nav/profile-side-nav.component";

@Component({
    selector: 'app-customer-profile-layout',
    templateUrl: './layout.component.html',
    imports: [RouterOutlet, ProfileSideNavComponent]
})
export class CustomerProfileLayout { }
