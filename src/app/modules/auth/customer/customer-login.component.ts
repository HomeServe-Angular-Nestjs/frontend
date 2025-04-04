import { Component, inject, OnInit } from "@angular/core";
import { LoginBaseComponent } from "../../shared/components/login/login-base/login-base.component";
import { LOGIN_CONFIGS } from "../../config/login.config";
import { ThemeService } from "../../../core/services/public/theme.service";
import { Store } from "@ngrx/store";
import { authActions } from "../../../store/actions/auth.actions";

@Component({
    selector: 'app-customer-login',
    template: `
    <app-login-base [config]='config'></app-login-base>
    `,
    imports: [LoginBaseComponent],
})
export class CustomerLoginComponent implements OnInit{
    private store = inject(Store);

    config = LOGIN_CONFIGS.customer;

    // constructor(private themeService: ThemeService) {
    //     this.themeService.setTheme('customer');
    // }

    ngOnInit(): void {
        this.store.dispatch(authActions.setUserType({ userType: this.config.type }))
    }
}