import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { offeredServiceActions } from '../../../../../../store/offered-services/offeredService.action';
import { ServiceListViewComponent } from '../../../../partials/sections/provider/service-list-view/service-list-view.component';
import { Observable } from 'rxjs';
import { IOfferedService, IToggleServiceStatus, IUpdateSubservice } from '../../../../../../core/models/offeredService.model';
import { FilterDeletedSubservicePipe } from '../../../../../../core/pipes/filter-deleted-sub-services.pipe';
import { OfferedServicesService } from '../../../../../../core/services/service-management.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';

@Component({
  selector: 'app-service-view',
  standalone: true,
  imports: [CommonModule, RouterLink, ServiceListViewComponent, FilterDeletedSubservicePipe],
  templateUrl: './service-view.component.html',
})
export class ServiceViewComponent {
  private readonly _serviceManagementService = inject(OfferedServicesService);
  private readonly _toastr = inject(ToastNotificationService);

  offeredServices$!: Observable<IOfferedService[]>;

  constructor(private store: Store) {
    this.offeredServices$ = this._loadServices();
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
        this._toastr.error(err);
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
        this._toastr.error(err);
      }
    });
  }

  private _loadServices() {
    return this._serviceManagementService.fetchOfferedServices();
  }
}
