import { Component } from "@angular/core";
import { SIGNUP_CONFIGS } from "../../config/signup.config";
import { SignupBaseComponent } from "../../shared/components/auth/signup-base/signup-base.component";

@Component({
    selector: 'app-provider-signup',
    template: `
    <app-signup-base [config]="config"></app-signup-base>
    `,
    imports: [SignupBaseComponent],

})
export class ProviderSignupComponent {
    config = SIGNUP_CONFIGS.provider;
}