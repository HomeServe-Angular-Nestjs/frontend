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
import { providerActions } from '../../../../../store/provider/provider.action';
import { NotificationService } from '../../../../../core/services/public/notification.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  imports: [CommonModule, TableComponent, FiltersComponent],
})
export class UserManagementComponent {
  private _store = inject(Store);
  private _roleSubject$ = new BehaviorSubject<'customer' | 'provider'>('customer');
  private _notyf = inject(NotificationService);
  role$ = this._roleSubject$.asObservable();



  constructor() {
    this._store.dispatch(userActions.fetchUsers());
  }

  customers$: Observable<ICustomer[]> = this._store.select(selectAllCustomers).pipe(startWith([]));
  providers$: Observable<IProvider[]> = this._store.select(selectAllProviderEntities).pipe(startWith([]));

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


  onActionFromTable(event: { actions: TableAction, row: TableRow }) {
    const { actions, row } = event;

    switch (actions.action) {
      case "toggleStatus":
        console.log('toggle status')
        const userType = this._roleSubject$.value;
        if (row.id) {
          this.handleToggleStatus(userType, row.id, row.status)
        } else {
          this._notyf.error('Missing email or status in row data');
        }
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

  private handleToggleStatus(userType: 'customer' | 'provider', id: string, status: string) {
    const isCurrentlyActive = status === 'Active';
    const isActive = !isCurrentlyActive;

    if (userType === 'customer') {
      this._store.dispatch(customerActions.updateCustomer({ data: { isActive }, id }))
    } else if (userType === 'provider') {
      const providerData = { id, isActive };
      const formData = new FormData();
      formData.append('providerData', JSON.stringify(providerData));
      this._store.dispatch(providerActions.updateProvider({ updateProviderData: formData }));
    }
  }


  onRoleChange(newRole: 'customer' | 'provider') {
    this._roleSubject$.next(newRole);
  }

}