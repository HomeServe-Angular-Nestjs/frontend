import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { authActions } from './store/auth/auth.actions';
import { UserType } from './modules/shared/models/user.model';
import { subscriptionAction } from './store/subscriptions/subscription.action';
import { selectSelectedSubscription } from './store/subscriptions/subscription.selector';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly _router = inject(Router);
  private readonly _store = inject(Store);

  private readonly _destroy$ = new Subject<void>();

  ngOnInit(): void {
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this._destroy$),
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects.split('/');
      let userType: UserType = 'customer';

      if (url.includes('provider')) {
        userType = 'provider';
      } else if (url.includes('admin')) {
        userType = 'admin';
      }

      this._store.dispatch(authActions.setUserType({ userType }));

      // // Check if the user is already subscribed.
      // this._store.dispatch(subscriptionAction.fetchSubscriptions());
      // this._store.select(selectSelectedSubscription).pipe(
      //   map(Boolean),
      //   takeUntil(this._destroy$)
      // ).subscribe(isSubscribed => {
      //   let value = false;
      //   if (!isSubscribed) value = true
      //   this._store.dispatch(authActions.updateShowSubscriptionPageValue({ value }));
      // });
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
