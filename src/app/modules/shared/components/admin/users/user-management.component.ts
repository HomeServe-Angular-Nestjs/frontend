import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter, map, Observable, Subject, switchMap, takeUntil, tap, BehaviorSubject, combineLatest } from 'rxjs';
import { IUpdateUserStatus, IUserData, UType } from '../../../../../core/models/user.model';
import { ToastNotificationService } from '../../../../../core/services/public/toastr.service';
import { createAdminTableUI } from '../../../../../core/utils/generate-tables.utils';
import { AdminService } from '../../../../../core/services/admin.service';
import { IPagination } from '../../../../../core/models/booking.model';
import { IFilter } from '../../../../../core/models/filter.model';
import { TableData, UserTableRow } from '../../../../../core/models/table.model';
import { AdminPaginationComponent } from "../../../partials/sections/admin/pagination/pagination.component";
import { FiltersComponent } from '../../../partials/sections/admin/filters/filters.component';
import { AdminTableComponent } from '../../../partials/sections/admin/tables/admin-table/table.component';
import { SharedDataService } from '../../../../../core/services/public/shared-data.service';


@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  imports: [CommonModule, AdminTableComponent, FiltersComponent, AdminPaginationComponent],
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private readonly _userManagementService = inject(AdminService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _sharedData = inject(SharedDataService);

  private readonly destroy$ = new Subject<void>();
  private readonly _refresh$ = new BehaviorSubject<void>(undefined);

  private _currentPage = 1;
  private _currentFilter: IFilter = {};

  tableData$!: Observable<TableData<UserTableRow>>;
  pagination!: IPagination;
  column: string[] = ['id', 'username', 'email', 'contact', 'status', 'joined'];

  ngOnInit(): void {
    this._sharedData.setAdminHeader('User Management');

    this.tableData$ = combineLatest([
      this._userManagementService.role$,
      this._refresh$
    ]).pipe(
      takeUntil(this.destroy$),
      switchMap(([role]) =>
        this._userManagementService.getUsers(role, this._currentFilter, this._currentPage).pipe(
          tap(userData => this.pagination = userData.pagination),
          map(userData => createAdminTableUI(this.column, userData.data))
        )
      )
    );
  }

  filterEvent(filter: IFilter) {
    this._currentFilter = filter;
    this._currentPage = 1;
    this._refresh$.next();
  }

  onRoleChange(role: UType) {
    this._userManagementService.setRole(role);
    this._currentPage = 1;
  }

  onActionFromTable(updateData: any) {
    const role = this._userManagementService.currentRole;
    const { action, userId, status } = updateData;
    const payload = { userId, status, role };

    if (action === 'status') {
      this._userManagementService.updateStatus(payload).subscribe({
        next: (success) => {
          if (success) {
            const statusAction = status ? 'blocked' : 'unblocked';
            this._toastr.success(`User ${statusAction}`);
            this._refresh$.next();
          }
        },
        error: (err) => {
          this._toastr.error('Oops, ', err);
        }
      });
    } else if (action === 'delete') {
      this._userManagementService.removeUser({ userId, role }).subscribe({
        next: (success) => {
          if (success) {
            this._toastr.success('User Removed');
            this._refresh$.next();
          }
        },
        error: (err) => {
          this._toastr.error('Oops, ', err);
        }
      });
    } else if (action === 'view') {
      // Handle view action if needed
      console.log('Viewing user:', userId);
    }
  }

  onPageChange(newPage: number) {
    this._currentPage = newPage;
    this._refresh$.next();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}