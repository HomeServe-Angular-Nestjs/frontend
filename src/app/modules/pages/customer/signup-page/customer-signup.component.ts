import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { SIGNUP_CONFIGS } from "../../../config/signup.config";
import { SignupBaseComponent } from "../../../shared/components/auth/signup-base/signup-base.component";

@Component({
    selector: 'app-customer-signup',
    template: `
    <app-signup-base [config]="config"></app-signup-base>
    `,
    imports: [SignupBaseComponent]
})
export class CustomerSignupComponent {
    config = SIGNUP_CONFIGS.customer;

    constructor(private store: Store) {
        
    }
}   