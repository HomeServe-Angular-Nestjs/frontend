import { Component } from "@angular/core";
import { SignupBaseComponent } from "../../shared/components/signup/signup-base/signup-base.component";
import { SIGNUP_CONFIGS } from "../../config/signup.config";
import { ThemeService } from "../../../core/services/public/theme.service";

@Component({
    selector: 'app-provider-signup',
    template: `
    <app-signup-base [config]="config"></app-signup-base>
    `,
    imports: [SignupBaseComponent],

})
export class ProviderSignupComponent {
    config = SIGNUP_CONFIGS.provider;

    constructor(private themeService: ThemeService) {
        this.themeService.setTheme("provider");
    }
}