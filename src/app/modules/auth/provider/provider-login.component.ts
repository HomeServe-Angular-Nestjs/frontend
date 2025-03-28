import { Component } from "@angular/core";
import { LoginBaseComponent } from "../../shared/components/login/login-base/login-base.component";
import { LOGIN_CONFIGS } from "../../config/login.config";
import { ThemeService } from "../../../core/services/public/theme.service";

@Component({
    selector: 'app-provider-login',
    template: `
    <app-login-base [config]="config"></app-login-base>
    `,
    imports: [LoginBaseComponent]
})
export class ProviderLoginComponent {
    config = LOGIN_CONFIGS.provider;

    constructor(private themeService: ThemeService) {
        this.themeService.setTheme('customer');
    }
}