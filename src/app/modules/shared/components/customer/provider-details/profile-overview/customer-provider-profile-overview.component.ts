import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProvider } from '../../../../../../core/models/user.model';
import { Subscription } from 'rxjs';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { getColorFromChar } from '../../../../../../core/utils/style.utils';
import { Store } from '@ngrx/store';
import { customerActions } from '../../../../../../store/customer/customer.actions';
import { IsSavedPipe } from '../../../../../../core/pipes/is-saved-provider.pipe';

@Component({
  selector: 'app-customer-provider-profile-overview',
  standalone: true,
  imports: [CommonModule, IsSavedPipe],
  templateUrl: './customer-provider-profile-overview.component.html',
})
export class CustomerProviderProfileOverviewComponent implements OnInit, OnDestroy {
  private providerService = inject(ProviderService);
  private _store = inject(Store)

  private providerDataSub!: Subscription;

  providerData!: IProvider | null;
  fallbackChar: string = '';

  ngOnInit(): void {
    this.providerDataSub = this.providerService.providerData$.subscribe(data => {
      this.providerData = data;
    });
  }

  fallbackColor(text: string | undefined): string {
    if (text) {
      this.fallbackChar = text[0].toUpperCase();
      return getColorFromChar(this.fallbackChar);
    }
    return '#dbeafe';
  }

  addToSaved(providerId: string | undefined) {
    if (providerId) {
      this._store.dispatch(customerActions.updateAddToSaved({ providerId }))
    }
  }

  ngOnDestroy(): void {
    if (this.providerDataSub) {
      this.providerDataSub.unsubscribe();
    }
  }
}
