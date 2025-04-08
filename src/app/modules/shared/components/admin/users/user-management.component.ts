import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TableComponent } from "../../../UI/tables/table.component";
import { customerActions, userActions } from '../../../../../store/actions/user.actions';
import { combineLatest, filter, map, Observable, startWith } from 'rxjs';
import { ICustomer, IProvider, UsersViewModel } from '../../../../../store/models/user.model';
import { selectAllCustomers, selectAllProviders } from '../../../../../store/selectors/user.selector';
import { createUserTable } from '../../../../../core/utils/generate-tables.utils';
import { TableAction, TableRow } from '../../../../../store/models/table.model';
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

  onActionFromTable(event: { actions: TableAction, row: TableRow }, userType: 'customer' | 'provider') {
    switch (event.actions.action) {
      case "toggleStatus":
        console.log('toggle status')
        // this.handleToggleStatus(userType, event.row.email, event.row.status)
        break;
      case "delete":
        console.log('delete')
        break;
      case "view":
        console.log('view');
        break;
      default:
        console.warn('Unknown actions')
    }
  }

  private handleToggleStatus(userType: 'customer' | 'provider', email: string, status: string) {
    const isActive = status === 'Active';

    const actionMap = {
      customer: customerActions.updateCustomer,
      provider: customerActions.updateCustomer
    }

    const action = actionMap[userType];
    if (action) {
      this.store.dispatch(action({ email, data: { isActive: !isActive } }));
    }
  }

}
