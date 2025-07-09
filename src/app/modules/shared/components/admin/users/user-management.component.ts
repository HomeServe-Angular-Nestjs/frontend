import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter, map, Observable, switchMap, tap } from 'rxjs';
import { IUpdateUserStatus, IUserData, UType } from '../../../../../core/models/user.model';
import { ToastNotificationService } from '../../../../../core/services/public/toastr.service';
import { createAdminTableUI } from '../../../../../core/utils/generate-tables.utils';
import { AdminService } from '../../../../../core/services/admin.service';
import { IPagination } from '../../../../../core/models/booking.model';
import { IFilter } from '../../../../../core/models/filter.model';
import { TableData, UserTableRow } from '../../../../../core/models/table.model';
import { AdminPaginationComponent } from "../../../partials/sections/admin/pagination/pagination.component";
import { FiltersComponent } from '../../../partials/sections/admin/filters/filters.component';
import { TableComponent } from '../../../partials/sections/admin/tables/table.component';


@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  imports: [CommonModule, TableComponent, FiltersComponent, AdminPaginationComponent],
})
export class UserManagementComponent implements OnInit {
  private _userManagementService = inject(AdminService);
  private _toastr = inject(ToastNotificationService);

  tableData$!: Observable<TableData<UserTableRow>>;
  pagination!: IPagination;
  column: string[] = ['id', 'username', 'email', 'contact', 'status', 'joined', 'actions'];
  lastFilterUsed: IFilter = {};

  ngOnInit(): void {
    this._loadTableData({});
    this.tableData$ = this._userManagementService.userData$.pipe(
      filter((users): users is IUserData[] => users !== null),
      map(users => {
        const filtered = users.filter(user => !user.isDeleted);
        return createAdminTableUI(this.column, filtered);
      })
    );
  }

  filterEvent(filter: IFilter) {
    this._loadTableData(filter);
  }

  onRoleChange(role: UType) {
    this._userManagementService.setRole(role);
  }

  onActionFromTable(updateData: IUpdateUserStatus) {
    const role = this._userManagementService.currentRole;
    const { action, ...rest } = updateData;
    const payload = { ...rest, role };

    if (action === 'status') {
      this._userManagementService.updateStatus(payload).subscribe({
        next: (success) => {
          if (success) {
            const action = updateData.status ? 'blocked' : 'unblocked';
            this._toastr.success(`User ${action}`);
          }
        },
        error: (err) => {
          this._toastr.error('Oops, ', err);
        }
      });
    } else if (action === 'delete') {
      this._userManagementService.removeUser(payload).subscribe({
        next: (success) => {
          if (success) {
            const filtered = (this._userManagementService.users ?? []).filter(user => user.id !== rest.userId);
            this._userManagementService.setUserData(filtered);
            this._toastr.success('User Removed');
          }
        },
        error: (err) => {
          this._toastr.error('Oops, ', err);
        }
      })
    }
  }

  onPageChange(newPage: number) {
    console.log(newPage)
    this._loadTableData(this.lastFilterUsed, newPage);
  }

  private _loadTableData(filter: IFilter, page: number = 1): void {
    this.lastFilterUsed = filter;

    this._userManagementService.role$.pipe(
      switchMap(role => this._userManagementService.getUsers(role, filter, page)),
      tap(userData => this.pagination = userData.pagination)
    ).subscribe();
  }
}