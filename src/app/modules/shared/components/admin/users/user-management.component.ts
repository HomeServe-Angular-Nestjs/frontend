import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { userActions } from '../../../../../store/users/user.actions';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';
import { ICustomer, IProvider } from '../../../../../core/models/user.model';
import { selectAllCustomers, selectAllProviderEntities } from '../../../../../store/users/user.selector';
import { createUserTable } from '../../../../../core/utils/generate-tables.utils';
import { TableAction, TableRow } from '../../../../../core/models/table.model';
import { TableComponent } from '../../../partials/shared/tables/table.component';
import { FiltersComponent } from '../../../partials/shared/filters/filters.component';
import { NotificationService } from '../../../../../core/services/public/notification.service';

type UType = 'customer' | 'provider';
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


  /**
   * Handles actions emitted from the UI table, such as toggling status or deleting a user.
   * @param event - Object containing the `action` type and corresponding `row` data.
   */
  onActionFromTable(event: { actions: TableAction, row: TableRow }) {
    const { actions, row } = event;
    const userType = this._roleSubject$.value;
    const id = row.id;
    if (!id) {
      this._notyf.error('Missing id in row data');
    }

    switch (actions.action) {
      case "toggleStatus":
        this._handleToggleStatus(userType, id, actions.value as boolean);
        break;
      case "delete":
        console.log('delete');
        this._handleDelete(userType, id, actions.value as boolean);
        break;
      case "view":
        console.log('view');
        break;
      default:
        console.warn('Unknown actions')
    }
  }

  filterEvent(event: any) {
    console.log(event)
  }

  /**
  * Changes the currently selected user role.
  * @param newRole - The new role to set ('customer' or 'provider').
  */
  onRoleChange(newRole: UType) {
    this._roleSubject$.next(newRole);
  }

  /**
   * Handles toggling the active status of a user.
   * @param userType - The type of user ('customer' or 'provider').
   * @param id - The ID of the user to update.
   * @param status - The current active status (true for active, false for inactive).
   */
  private _handleToggleStatus(userType: UType, id: string, status: boolean) {
    const data = { id, isActive: !status };
    this._dispatchAction(userType, data);
  }

  /**
   * Handles toggling the deleted status of a user.
   * @param userType - The type of user ('customer' or 'provider').
   * @param id - The ID of the user to update.
   * @param status - The current deleted status (true for deleted, false for not deleted).
   */
  private _handleDelete(userType: UType, id: string, status: boolean) {
    const data = { id, isDeleted: !status };
    this._dispatchAction(userType, data);
  }

  /**
  * Dispatches the correct partial update action based on the user type.
  * @param userType - The type of user ('customer' or 'provider').
  * @param data - Partial user data containing fields to update.
  */
  private _dispatchAction(userType: UType, data: Partial<ICustomer> | Partial<IProvider>) {
    if (userType === 'customer') {
      this._store.dispatch(userActions.partialUpdateCustomer({ updateData: data }))
    } else if (userType === 'provider') {
      this._store.dispatch(userActions.partialUpdateProvider({ updateData: data }));
    }
  }
}