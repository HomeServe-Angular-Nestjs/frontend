import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TableComponent } from "../../../UI/tables/table.component";
import { userActions } from '../../../../../store/actions/user.actions';
import { combineLatest, filter, map, Observable, startWith } from 'rxjs';
import { ICustomer, IProvider, UsersViewModel } from '../../../../../store/models/user.model';
import { selectAllCustomers, selectAllProviders } from '../../../../../store/selectors/user.selector';
import { createUserTable } from '../../../../../core/utils/generate-tables.utils';
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  imports: [CommonModule, TableComponent],
})
export class UserManagementComponent {
  private store = inject(Store);

  constructor() {
    this.store.dispatch(userActions.fetchUsers());
  }

  customers$: Observable<ICustomer[]> = this.store.select(selectAllCustomers).pipe(startWith([]));
  providers$: Observable<IProvider[]> = this.store.select(selectAllProviders).pipe(startWith([]));


  vm$ = combineLatest([this.customers$, this.providers$]).pipe(
    map(([customers, providers]) => {
      const customerTable = createUserTable(customers);
      const providerTable = createUserTable(providers);
      return { customerTable, providerTable } as UsersViewModel;
    })
  );
}
