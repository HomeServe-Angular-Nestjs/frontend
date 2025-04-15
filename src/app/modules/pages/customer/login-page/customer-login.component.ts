import { Component } from "@angular/core";
import { LoginBaseComponent } from "../../../shared/components/login/login-base/login-base.component";
import { LOGIN_CONFIGS } from "../../../config/login.config";
import { Store } from "@ngrx/store";
import { authActions } from "../../../../store/actions/auth.actions";

@Component({
    selector: 'app-customer-login',
    template: `
    <app-login-base [config]='config'></app-login-base>
    `,
    imports: [LoginBaseComponent],
})
export class CustomerLoginComponent {
    config = LOGIN_CONFIGS.customer;

    constructor(private store: Store) {
        this.store.dispatch(authActions.setUserType({ userType: 'customer' }));
    }
}