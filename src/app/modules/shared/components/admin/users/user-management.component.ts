import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable, switchMap } from 'rxjs';
import { IUpdateUserStatus, UType } from '../../../../../core/models/user.model';
import { createAdminTableUI } from '../../../../../core/utils/generate-tables.utils';
import { TableData } from '../../../../../core/models/table.model';
import { TableComponent } from '../../../partials/sections/admin/tables/table.component';
import { FiltersComponent } from '../../../partials/sections/admin/filters/filters.component';
import { IFilter } from '../../../../../core/models/filter.model';
import { AdminPaginationComponent } from "../../../partials/sections/admin/pagination/pagination.component";
import { UserManagementService } from '../../../../../core/services/user.service';
import { ToastNotificationService } from '../../../../../core/services/public/toastr.service';


@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  imports: [CommonModule, TableComponent, FiltersComponent, AdminPaginationComponent],
})
export class UserManagementComponent implements OnInit {
  private _userManagementService = inject(UserManagementService);
  private _toastr = inject(ToastNotificationService);

  tableData$!: Observable<TableData>;
  column: string[] = ['id', 'username', 'email', 'contact', 'status', 'joined', 'actions'];

  ngOnInit(): void {
    this._loadTableData({});
  }

  filterEvent(filter: IFilter) {
    this._loadTableData(filter);
  }

  onRoleChange(role: UType) {
    this._userManagementService.setRole(role);
  }

  onActionFromTable(updateData: IUpdateUserStatus) {
    this._userManagementService.role$.pipe(
      switchMap(role =>
        this._userManagementService.updateStatus({ ...updateData, role })
      )
    ).subscribe({
      next: (success) => {
        if (success) {
          const action = updateData.status ? 'blocked' : 'unblocked';
          this._toastr.success(`User ${action}`)
        }
      },
      error: (err) => {
        this._toastr.error('Oops, ', err);
      }
    });
  }

  private _loadTableData(filter: IFilter): void {
    this.tableData$ = this._userManagementService.role$.pipe(
      switchMap(role => {
        return this._userManagementService.getUsers(role, filter).pipe(
          map(users => createAdminTableUI(this.column, users))
        );
      })
    );
  }

  // constructor() {
  //   this._store.dispatch(userActions.fetchUsers());
  // }

  // customers$: Observable<ICustomer[]> = this._store.select(selectAllCustomers).pipe(startWith([]));
  // providers$: Observable<IProvider[]> = this._store.select(selectAllProviderEntities).pipe(startWith([]));

  // vm$ = combineLatest([this.customers$, this.providers$]).pipe(
  //   map(([customers, providers]) => ({
  //     customerTable: createAdminTableUI(customers),
  //     providerTable: createAdminTableUI(providers),
  //   }))
  // );

  // filteredData$ = combineLatest([this.vm$, this.role$]).pipe(
  //   map(([vm, role]) => ({
  //     tableData: role === 'customer' ? vm.customerTable : vm.providerTable,
  //     currentRole: role,
  //   }))
  // );


  // /**
  //  * Handles actions emitted from the UI table, such as toggling status or deleting a user.
  //  * @param event - Object containing the `action` type and corresponding `row` data.
  //  */
  // onActionFromTable(event: { actions: TableAction, row: TableRow }) {
  //   const { actions, row } = event;
  //   const userType = this._roleSubject$.value;
  //   const id = row.id;
  //   if (!id) {
  //     this._notyf.error('Missing id in row data');
  //   }

  //   switch (actions.action) {
  //     case "toggleStatus":
  //       this._handleToggleStatus(userType, id, actions.value as boolean);
  //       break;
  //     case "delete":
  //       console.log('delete');
  //       this._handleDelete(userType, id, actions.value as boolean);
  //       break;
  //     case "view":
  //       console.log('view');
  //       break;
  //     default:
  //       console.warn('Unknown actions')
  //   }
  // }

  // /**
  //  * Handles filtering of Table data.
  //  * @param filter - The filter data contains search input, user status
  //  */
  // filterEvent(filter: IFilter) {
  //   this.role$.subscribe(role => {
  //     if (role === 'customer') {
  //       this._store.dispatch(userActions.filterCustomer({ filter }));
  //     } else if (role === 'provider') {
  //       console.log(filter)
  //       this._store.dispatch(userActions.filterProvider({ filter }));
  //     }
  //   });
  // }

  // /**
  // * Changes the currently selected user role.
  // * @param newRole - The new role to set ('customer' or 'provider').
  // */
  // onRoleChange(newRole: UType) {
  //   this._roleSubject$.next(newRole);
  // }

  // /**
  //  * Handles toggling the active status of a user.
  //  * @param userType - The type of user ('customer' or 'provider').
  //  * @param id - The ID of the user to update.
  //  * @param status - The current active status (true for active, false for inactive).
  //  */
  // private _handleToggleStatus(userType: UType, id: string, status: boolean) {
  //   const data = { id, isActive: !status };
  //   this._dispatchAction(userType, data);
  // }

  // /**
  //  * Handles toggling the deleted status of a user.
  //  * @param userType - The type of user ('customer' or 'provider').
  //  * @param id - The ID of the user to update.
  //  * @param status - The current deleted status (true for deleted, false for not deleted).
  //  */
  // private _handleDelete(userType: UType, id: string, status: boolean) {
  //   const data = { id, isDeleted: !status };
  //   this._dispatchAction(userType, data);
  // }

  // /**
  // * Dispatches the correct partial update action based on the user type.
  // * @param userType - The type of user ('customer' or 'provider').
  // * @param data - Partial user data containing fields to update.
  // */
  // private _dispatchAction(userType: UType, data: Partial<ICustomer> | Partial<IProvider>) {
  //   if (userType === 'customer') {
  //     this._store.dispatch(userActions.partialUpdateCustomer({ updateData: data }))
  //   } else if (userType === 'provider') {
  //     this._store.dispatch(userActions.partialUpdateProvider({ updateData: data }));
  //   }
  // }
}