import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
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
import { IFilter } from '../../../../core/models/filter.model';

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
export class CustomerViewProvidersComponent implements OnInit {
  private _store = inject(Store);
  providers$!: Observable<IProvider[]>;

  @ViewChild(ProviderViewCardFilterComponent)
  filterComponent!: ProviderViewCardFilterComponent

  ngOnInit(): void {
    this._store.dispatch(userActions.fetchProviders());
    this.providers$ = this._store.select(selectAllProviderEntities);
  }

  applyFilters(filter: IFilter) {
    this._store.dispatch(userActions.filterProvider({ filter }));
  }

  resetFilters() {
    if(this.filterComponent){
      this.filterComponent.reset();
    }
  }
}
