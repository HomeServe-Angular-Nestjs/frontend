import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { offeredServiceActions } from '../../../../../../store/offered-services/offeredService.action';
import { ServiceListViewComponent } from '../../../../partials/sections/provider/service-list-view/service-list-view.component';
import { selectAllOfferedServices } from '../../../../../../store/offered-services/offeredService.selector';
import { Observable } from 'rxjs';
import { IOfferedService, UpdateSubserviceType } from '../../../../../../core/models/offeredService.model';
import { FilterDeletedSubservicePipe } from '../../../../../../core/pipes/filter-deleted-sub-services.pipe';

@Component({
  selector: 'app-service-view',
  standalone: true,
  imports: [CommonModule, RouterLink, ServiceListViewComponent, FilterDeletedSubservicePipe],
  templateUrl: './service-view.component.html',
})
export class ServiceViewComponent {
  offeredServices$!: Observable<IOfferedService[]>;

  constructor(private store: Store) {
    this.store.dispatch(offeredServiceActions.fetchOfferedServices());
    this.offeredServices$ = this.store.select(selectAllOfferedServices);
  }

  updateService(updateData: Partial<IOfferedService>) {
    this.store.dispatch(offeredServiceActions.updateOfferedService({ updateData }));
  }

  updateSubservice(updateData: UpdateSubserviceType) {
    this.store.dispatch(offeredServiceActions.updateSubService({ updateData }));
  }
}
