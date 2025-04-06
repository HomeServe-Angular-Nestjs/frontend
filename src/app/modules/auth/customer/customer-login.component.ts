import { Component, inject } from "@angular/core";
import { LoginBaseComponent } from "../../shared/components/login/login-base/login-base.component";
import { LOGIN_CONFIGS } from "../../config/login.config";
import { Store } from "@ngrx/store";

@Component({
    selector: 'app-customer-login',
    template: `
    <app-login-base [config]='config'></app-login-base>
    `,
    imports: [LoginBaseComponent],
})
export class CustomerLoginComponent {
    config = LOGIN_CONFIGS.customer;
}