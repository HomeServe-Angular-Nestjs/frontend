import { Component, inject, OnInit } from "@angular/core";
import { LOGIN_CONFIGS } from "../../../config/login.config";
import { LoginBaseComponent } from "../../../shared/components/auth/login-base/login-base.component";
import { Store } from "@ngrx/store";
import { authActions } from "../../../../store/auth/auth.actions";

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