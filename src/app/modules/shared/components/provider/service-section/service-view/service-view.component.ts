import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceListViewComponent } from '../../../../partials/sections/provider/service-list-view/service-list-view.component';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { IOfferedService, IServiceFilter, IToggleServiceStatus, IUpdateSubservice } from '../../../../../../core/models/offeredService.model';
import { FilterDeletedSubservicePipe } from '../../../../../../core/pipes/filter-deleted-sub-services.pipe';
import { OfferedServicesService } from '../../../../../../core/services/service-management-test.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { ProviderServiceFilterComponent } from "../../manage-service/service-filter/service-filter.component";
import { ProviderPaginationComponent } from "../../../../partials/sections/provider/pagination/provider-pagination.component";
import { IPagination } from '../../../../../../core/models/booking.model';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';

@Component({
  selector: 'app-service-view',
  standalone: true,
  templateUrl: './service-view.component.html',
  imports: [CommonModule, RouterLink, ServiceListViewComponent, FilterDeletedSubservicePipe, ProviderServiceFilterComponent, ProviderPaginationComponent],
  providers: [DebounceService]
})
export class ServiceViewComponent implements OnInit, OnDestroy {
  private readonly _serviceManagementService = inject(OfferedServicesService);
  private readonly _toastr = inject(ToastNotificationService);

  private _destroy$ = new Subject<void>();
  private _filters$ = new BehaviorSubject<IServiceFilter>({});


  offeredServices$!: Observable<IOfferedService[]>;
  filters: IServiceFilter = {};

  pagination: IPagination = {
    page: 1,
    limit: 1,
    total: 1
  }

  ngOnInit() {
    this._filters$
      .pipe(takeUntil(this._destroy$))
      .subscribe((filter) => {
        this._loadServices(filter);
      })

    this.offeredServices$ = this._serviceManagementService.storedServiceData$;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }


  toggleStatus(updateData: IToggleServiceStatus) {
    this._serviceManagementService.toggleServiceStatus(updateData).subscribe({
      next: (success) => {
        if (success) {
          this._toastr.success('Status updated');
        } else {
          this._toastr.error('Failed to update status');
        }
      },
      error: (err) => {
        const message = 'something went wrong';
        console.error([ServiceViewComponent.name], message);
        this._toastr.error(message);
      }
    });
  }

  updateSubservice(updateData: IUpdateSubservice) {
    this._serviceManagementService.toggleSubServiceStatus(updateData).subscribe({
      next: (success) => {
        if (success) {
          this._toastr.success('Status updated');
        } else {
          this._toastr.error('Failed to update status');
        }
      },
      error: (err) => {
        const message = 'something went wrong';
        console.error([ServiceViewComponent.name], message);
        this._toastr.error(message);
      }
    });
  }

  applyFilters(filters: IServiceFilter) {
    this.filters = filters;
    this._filters$.next(filters);
  }

  changePage(page: number) {
    this._loadServices(this.filters, page);
  }

  private _loadServices(filters: IServiceFilter = {}, page: number = 1) {
    this._serviceManagementService.fetchOfferedServices(filters, page).subscribe({
      next: (serviceData) => {
        this._serviceManagementService.setServiceData(serviceData.services);
        this.pagination = serviceData.pagination;
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to fetch services';
        this._toastr.error(msg);
      }
    });
  }
}
