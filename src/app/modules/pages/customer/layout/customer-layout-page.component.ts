import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CustomerHeaderComponent } from '../../../shared/partials/sections/customer/header/header.component';
import { CustomerFooterComponent } from "../../../shared/partials/sections/customer/footer/customer-footer.component";
import { distinctUntilChanged, filter, map, Subject, takeUntil } from 'rxjs';
import { selectCheckStatus, selectShowSubscriptionPage } from '../../../../store/auth/auth.selector';
import { Store } from '@ngrx/store';
import { ChatSocketService } from '../../../../core/services/socket-service/chat.service';
import { authActions } from '../../../../store/auth/auth.actions';
import { VideoCallSocketService } from '../../../../core/services/socket-service/video-socket.service';
import { NotificationSocketService } from '../../../../core/services/socket-service/notification.service';
import { selectCustomer } from '../../../../store/customer/customer.selector';
import { NotificationTemplateId, NotificationType } from '../../../../core/enums/enums';

@Component({
  selector: 'app-customer-landing-page',
  imports: [CommonModule, CustomerHeaderComponent, RouterOutlet, CustomerFooterComponent],
  templateUrl: './customer-layout-page.component.html',
})
export class CustomerLayoutPageComponent implements OnInit, OnDestroy {
  private readonly _notificationService = inject(NotificationSocketService);
  private readonly _videoSocket = inject(VideoCallSocketService);
  private readonly _chatSocket = inject(ChatSocketService);
  private readonly _store = inject(Store);

  private _destroy$ = new Subject<void>();

  showSubscriptionPage$ = this._store.select(selectShowSubscriptionPage);

  ngOnInit(): void {
    const authStatus$ = this._store.select(selectCheckStatus).pipe(
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    );

    const customer$ = this._store.select(selectCustomer).pipe(
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    );

    // Connect socket when authenticated
    authStatus$.pipe(
      filter(status => status === 'authenticated')
    ).subscribe(() => {
      this._chatSocket.connect();
      // this._videoSocket.connect();
      this._notificationService.connect();
    });

    // Disconnect socket when unauthenticated
    authStatus$.pipe(
      filter(status => status !== 'authenticated')
    ).subscribe(() => {
      this._chatSocket.disconnect();
      // this._videoSocket.disconnect();
      this._notificationService.disconnect();
    });

    customer$.pipe(
      filter(customer => !!customer?.id),
      map(customer => ({
        id: customer?.id,
        address: customer?.address,
        fullname: customer?.fullname,
        phone: customer?.phone,
        avatar: customer?.avatar
      })),
      distinctUntilChanged((prev, curr) =>
        prev.address === curr.address &&
        prev.fullname === curr.fullname &&
        prev.phone === curr.phone &&
        prev.avatar === curr.avatar
      )
    ).subscribe(customer => {
      const isIncomplete = !customer.address || !customer.fullname || !customer.phone || !customer.avatar;
      console.log(customer);

      if (isIncomplete) {
        this._notificationService.sendNewNotification({
          title: 'Complete Your Profile',
          message: 'Your profile is missing some details.',
          type: NotificationType.SYSTEM,
          templateId: NotificationTemplateId.INCOMPLETE_PROFILE
        });
      } else {
        this._notificationService.removeNotification(NotificationTemplateId.INCOMPLETE_PROFILE);
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._chatSocket.stopListeningMessages();
    // this._notificationService.stopListeningNotifications();
  }

  proceedWithSub() {
    this._store.dispatch(authActions.updateShowSubscriptionPageValue({ value: false }));
  }
}
