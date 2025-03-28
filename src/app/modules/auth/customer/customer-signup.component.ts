import { Component } from "@angular/core";
import { SIGNUP_CONFIGS } from "../../config/signup.config";
import { SignupBaseComponent } from "../../shared/components/signup/signup-base/signup-base.component";
import { ThemeService } from "../../../core/services/public/theme.service";

@Component({
    selector: 'app-customer-signup',
    template: `
    <app-signup-base [config]="config"></app-signup-base>
    `,
    imports: [SignupBaseComponent]
})
export class CustomerSignupComponent {
    config = SIGNUP_CONFIGS.customer;

    // constructor(private themeService: ThemeService) {
    //     this.themeService.setTheme('customer');
    // }
}   