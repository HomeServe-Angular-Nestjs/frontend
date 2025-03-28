import { Component } from "@angular/core";
import { LoginBaseComponent } from "../../shared/components/login/login-base/login-base.component";
import { LOGIN_CONFIGS } from "../../config/login.config";
import { ThemeService } from "../../../core/services/public/theme.service";

@Component({
    selector: 'app-customer-login',
    template: `
    <app-login-base [config]='config'></app-login-base>
    `,
    imports: [LoginBaseComponent],
})
export class CustomerLoginComponent {
    config = LOGIN_CONFIGS.customer;

    constructor(private themeService: ThemeService) {
        this.themeService.setTheme('customer');
    }
}