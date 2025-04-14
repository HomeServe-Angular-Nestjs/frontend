import { Component } from "@angular/core";
import { SIGNUP_CONFIGS } from "../../../config/signup.config";
import { SignupBaseComponent } from "../../../shared/components/signup/signup-base/signup-base.component";
import { Store } from "@ngrx/store";
import { authActions } from "../../../../store/actions/auth.actions";

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