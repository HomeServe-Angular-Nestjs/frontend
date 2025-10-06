import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProvider, IProviderCardView } from '../../../../../core/models/user.model';
import { Router } from '@angular/router';
import { getColorFromChar } from '../../../../../core/utils/style.utils';
import { Store } from '@ngrx/store';
import { customerActions } from '../../../../../store/customer/customer.actions';
import { map, Observable, shareReplay, Subject, takeUntil } from 'rxjs';
import { IsSavedPipe } from '../../../../../core/pipes/is-saved-provider.pipe';
import { ProviderService } from '../../../../../core/services/provider.service';

@Component({
  selector: 'app-customer-provider-view-card',
  imports: [CommonModule, IsSavedPipe],
  templateUrl: './customer-provider-view-card.component.html',
})
export class CustomerProviderViewCardComponent implements OnInit, OnDestroy {
  private readonly _providerService = inject(ProviderService);
  private readonly _router = inject(Router);
  private readonly _store = inject(Store);

  private _destroy$ = new Subject<void>();

  @Input({ required: true }) providers!: IProviderCardView[];
  fallbackChar: string = '';

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete()
  }

  toggleFavorite(provider: IProvider) {
    provider.isActive = !provider.isActive;
  }

  fallbackColor(text: string) {
    this.fallbackChar = text.charAt(0).toUpperCase();
    return getColorFromChar(text.charAt(0));
  }

  addToSaved(providerId: string) {
    this._store.dispatch(customerActions.updateAddToSaved({ providerId }));
  }

  viewProvider(providerId: string) {
    this._router.navigate(['provider_details', providerId, 'about']);
  }

  getStarType(index: number, rating: number = 0): 'full' | 'half' | 'empty' {
    if (index < Math.floor(rating)) return 'full';
    if (index < rating) return 'half';
    return 'empty';
  }

  getAvgRating(providerId: string): Observable<number> {
    return this._providerService.getAvgRating(providerId).pipe(
      takeUntil(this._destroy$),
      map(res => res.data ?? 0),
      shareReplay(1)
    );
  }
}
