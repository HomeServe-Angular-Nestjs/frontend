import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { offeredServiceActions } from '../../../../../../../store/actions/offeredService.action';

@Component({
  selector: 'app-service-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-view.component.html',
})
export class ServiceViewComponent {

  constructor(private store: Store) {
    this.store.dispatch(offeredServiceActions.fetchOfferedServices());
  }



}
