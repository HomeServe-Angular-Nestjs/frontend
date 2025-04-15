import { Component } from "@angular/core";
import { LOGIN_CONFIGS } from "../../config/login.config";
import { LoginBaseComponent } from "../../shared/components/auth/login-base/login-base.component";

@Component({
    selector: 'app-provider-login',
    template: `
    <app-login-base [config]="config"></app-login-base>
    `,
    imports: [LoginBaseComponent]
})
export class ProviderLoginComponent {
    config = LOGIN_CONFIGS.provider;
}