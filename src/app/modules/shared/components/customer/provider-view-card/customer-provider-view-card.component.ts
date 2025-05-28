import { Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProvider } from '../../../../../core/models/user.model';
import { Router } from '@angular/router';
import { getColorFromChar } from '../../../../../core/utils/style.utils';
import { Store } from '@ngrx/store';
import { customerActions } from '../../../../../store/customer/customer.actions';
import { selectSavedProviders } from '../../../../../store/customer/customer.selector';
import { Subject, takeUntil } from 'rxjs';
import { IsSavedPipe } from '../../../../../core/pipes/is-saved-provider.pipe';

@Component({
  selector: 'app-customer-provider-view-card',
  standalone: true,
  imports: [CommonModule, IsSavedPipe],
  templateUrl: './customer-provider-view-card.component.html',
})
export class CustomerProviderViewCardComponent implements OnDestroy {
  private _router = inject(Router);
  private _store = inject(Store);

  private _destroy$ = new Subject<void>();

  @Input({ required: true }) providers!: IProvider[];
  fallbackChar: string = '';

  toggleFavorite(provider: IProvider) {
    provider.isActive = !provider.isActive;
  }

  fallbackColor(text: string) {
    this.fallbackChar = text.charAt(0).toUpperCase();
    return getColorFromChar(text.charAt(0));
  }

  addToSaved(providerId: string) {
    this._store.dispatch(customerActions.updateAddToSaved({ providerId }))
  }

  viewProvider(providerId: string) {
    this._router.navigate(['provider_details', providerId, 'about']);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete()
  }
}
