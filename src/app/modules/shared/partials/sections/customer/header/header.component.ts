import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../../../../../../store/actions/auth.actions';
import { Observable } from 'rxjs';
import { selectCheckStatus } from '../../../../../../store/selectors/auth.selector';
import { StatusType } from '../../../../../../store/models/auth.model';

@Component({
  selector: 'app-customer-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
})
export class CustomerHeaderComponent {
  userStatus$!: Observable<StatusType>;

  constructor(private store: Store) {
    this.userStatus$ = this.store.select(selectCheckStatus);
  }

  logout(): void {
    this.store.dispatch(authActions.logout({ userType: 'customer' }));
  }
}
