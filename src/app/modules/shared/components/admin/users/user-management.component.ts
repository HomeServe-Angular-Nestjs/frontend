import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { customerActions, userActions } from '../../../../../store/users/user.actions';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';
import { ICustomer, IProvider } from '../../../../../core/models/user.model';
import { selectAllCustomers, selectAllProviderEntities } from '../../../../../store/users/user.selector';
import { createUserTable } from '../../../../../core/utils/generate-tables.utils';
import { TableAction, TableRow } from '../../../../../core/models/table.model';
import { TableComponent } from '../../../partials/shared/tables/table.component';
import { FiltersComponent } from '../../../partials/shared/filters/filters.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  imports: [CommonModule, TableComponent, FiltersComponent],
})
export class UserManagementComponent {
  private store = inject(Store);
  private roleSubject$ = new BehaviorSubject<'customer' | 'provider'>('customer');
  role$ = this.roleSubject$.asObservable();

  constructor() {
    this.store.dispatch(userActions.fetchUsers());
  }

  customers$: Observable<ICustomer[]> = this.store.select(selectAllCustomers).pipe(startWith([]));
  providers$: Observable<IProvider[]> = this.store.select(selectAllProviderEntities).pipe(startWith([]));

  vm$ = combineLatest([this.customers$, this.providers$]).pipe(
    map(([customers, providers]) => ({
      customerTable: createUserTable(customers),
      providerTable: createUserTable(providers),
    }))
  );

  filteredData$ = combineLatest([this.vm$, this.role$]).pipe(
    map(([vm, role]) => ({
      tableData: role === 'customer' ? vm.customerTable : vm.providerTable,
      currentRole: role,
    }))
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

  onRoleChange(newRole: any) {
    this.roleSubject$.next(newRole);
  }

}
