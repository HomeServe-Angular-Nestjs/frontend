import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Store } from '@ngrx/store';
import { authActions } from './store/actions/auth.actions';
import { UserType } from './modules/shared/models/user.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private store: Store) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects.split('/');
      let userType: UserType = 'customer';

      if (url.includes('provider')) {
        userType = 'provider';
      } else if (url.includes('admin')) {
        userType = 'admin';
      }

      this.store.dispatch(authActions.setUserType({ userType }));

    });
  }
}
