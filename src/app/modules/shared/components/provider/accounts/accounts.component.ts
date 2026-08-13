import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectProvider } from '../../../../../store/provider/provider.selector';
import { ProviderPasswordsComponent } from "../password-setting/password.component";

@Component({
    selector: 'app-provider-accounts',
    standalone: true,
    imports: [CommonModule, ProviderPasswordsComponent],
    templateUrl: './accounts.component.html',
})
export class ProviderAccountsComponent {
    private readonly _store = inject(Store);

    readonly googleLogin$ = this._store.select(selectProvider).pipe(map(provider => !!provider?.googleId));
}
