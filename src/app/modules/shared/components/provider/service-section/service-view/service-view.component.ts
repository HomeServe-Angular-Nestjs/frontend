import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { offeredServiceActions } from '../../../../../../store/offered-services/offeredService.action';
import { ServiceListViewComponent } from '../../../../partials/sections/provider/service-list-view/service-list-view.component';
import { selectAllOfferedServices } from '../../../../../../store/offered-services/offeredService.selector';
import { Observable } from 'rxjs';
import { IOfferedService } from '../../../../../../core/models/offeredService.model';

@Component({
  selector: 'app-service-view',
  standalone: true,
  imports: [CommonModule, RouterLink, ServiceListViewComponent],
  templateUrl: './service-view.component.html',
})
export class ServiceViewComponent {
  offeredServices$!: Observable<IOfferedService[]>;
  // serviceSelectedForUpdate$!: Observable<IOfferedService>;

  constructor(private store: Store) {
    this.store.dispatch(offeredServiceActions.fetchOfferedServices());
    this.offeredServices$ = this.store.select(selectAllOfferedServices);
  }

  updateService(updateData: Partial<IOfferedService>) {
    this.store.dispatch(offeredServiceActions.updateOfferedService({ updateData }));
  }
}
