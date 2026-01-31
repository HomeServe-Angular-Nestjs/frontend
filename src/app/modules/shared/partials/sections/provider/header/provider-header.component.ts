import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { selectAllNotifications, showNotificationError } from '../../../../../../store/notification/notification.selector';
import { notificationAction } from '../../../../../../store/notification/notification.action';

@Component({
  selector: 'app-provider-header',
  templateUrl: './provider-header.component.html',
  imports: [CommonModule, RouterLink],
})
export class ProviderHeaderComponent implements OnInit, OnDestroy {
  private readonly _sharedService = inject(SharedDataService);
  private readonly _store = inject(Store);
  private _destroy$ = new Subject<void>();

  readonly providerHeader$ = this._sharedService.providerHeader$
    .pipe(takeUntil(this._destroy$));

  ngOnInit(): void {
    this._store.dispatch(notificationAction.fetchAllNotifications());

    // this._store.select(selectAllNotifications)
    //   .pipe(takeUntil(this._destroy$))
    //   .subscribe((notifications) => {
    //     console.log(notifications);
    //   });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
