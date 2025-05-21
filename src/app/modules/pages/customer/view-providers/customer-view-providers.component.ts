import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { userActions } from '../../../../store/users/user.actions';
import { Observable } from 'rxjs';
import { IProvider } from '../../../../core/models/user.model';
import { selectAllProviderEntities, selectProvidersEntities } from '../../../../store/users/user.selector';
import { CustomerProviderViewCardComponent } from "../../../shared/components/customer/provider-view-card/customer-provider-view-card.component";
import { ProviderViewCardFilterComponent } from "../../../shared/partials/sections/customer/provider-view-card-filter/provider-view-card-filter.component";

interface Provider {
  id: number;
  name: string;
  avatar: string;
  certified: boolean;
  rating: number;
  reviews: number;
  price: number;
  experience: number;
  distance: number;
  availableToday: boolean;
  specialOffer: boolean;
  fastResponse: boolean;
  isFavorite: boolean;
}

@Component({
  selector: 'app-customer-view-providers',
  standalone: true,
  imports: [CommonModule, CustomerBreadcrumbsComponent, FormsModule, CustomerProviderViewCardComponent, ProviderViewCardFilterComponent],
  templateUrl: './customer-view-providers.component.html',
})
export class CustomerViewProvidersComponent {
  readonly providers$!: Observable<IProvider[]>;

  constructor(private store: Store) {
    this.store.dispatch(userActions.fetchProviders());
    this.providers$ = this.store.select(selectAllProviderEntities);
  }


  resetFilters() { }

}
