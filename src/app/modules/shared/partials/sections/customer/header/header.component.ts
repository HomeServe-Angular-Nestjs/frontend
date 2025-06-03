import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../../../../../../store/auth/auth.actions';
import { map, Observable } from 'rxjs';
import { selectCheckStatus } from '../../../../../../store/auth/auth.selector';
import { StatusType } from '../../../../../../core/models/auth.model';
import { selectCustomer } from '../../../../../../store/customer/customer.selector';
import { ICustomer } from '../../../../../../core/models/user.model';
import { getColorFromChar } from '../../../../../../core/utils/style.utils';
import { customerActions } from '../../../../../../store/customer/customer.actions';

@Component({
  selector: 'app-customer-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
})
export class CustomerHeaderComponent implements OnInit {
  private _store = inject(Store);

  userStatus$!: Observable<StatusType>;
  email$!: Observable<string>;
  username$!: Observable<string>;
  fullname$!: Observable<string | null>;
  avatar$!: Observable<string | null>;
  fallbackChar$!: Observable<string>;
  fallbackColor$!: Observable<string>;

  ngOnInit(): void {
    this.userStatus$ = this._store.select(selectCheckStatus);
    this._store.dispatch(customerActions.fetchOneCustomer());

    const customer$ = this._store.select(selectCustomer);
    

    this.avatar$ = customer$.pipe(
      map(customer => customer?.avatar ?? null)
    );

    this.email$ = customer$.pipe(
      map((customer) => {
        if (customer && customer.email) {
          return customer.email
        }
        return ''
      })
    );

    this.username$ = customer$.pipe(
      map((customer) => {
        if (customer && customer.username) {
          return customer.username
        }
        return ''
      })
    );

    this.fullname$ = customer$.pipe(
      map((customer) => {
        if (customer && customer.fullname) {
          return customer.fullname
        }
        return ''
      })
    );


    this.fallbackChar$ = customer$.pipe(
      map(customer => {
        if (customer && customer.username) {
          return customer.username.charAt(0).toUpperCase();
        }
        return '';
      })
    );

    this.fallbackColor$ = this.fallbackChar$.pipe(
      map(char => char ? getColorFromChar(char) : '#4f46e5')
    );
  }

  logout(): void {
    this._store.dispatch(authActions.logout({ fromInterceptor: false }));
  }
}
