import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { authActions } from './store/auth/auth.actions';
import { UserType } from './modules/shared/models/user.model';
import { ChatSocketService } from './core/services/socket-service/chat.service';
import { selectCheckStatus } from './store/auth/auth.selector';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly _router = inject(Router);
  private readonly _store = inject(Store);
  private readonly _chatSocket = inject(ChatSocketService);

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
    });

   
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
