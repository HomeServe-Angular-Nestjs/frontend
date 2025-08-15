import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CustomerHeaderComponent } from '../../../shared/partials/sections/customer/header/header.component';
import { CustomerFooterComponent } from "../../../shared/partials/sections/customer/footer/customer-footer.component";
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { selectCheckStatus, selectShowSubscriptionPage } from '../../../../store/auth/auth.selector';
import { Store } from '@ngrx/store';
import { ChatSocketService } from '../../../../core/services/socket-service/chat.service';
import { authActions } from '../../../../store/auth/auth.actions';
import { VideoCallSocketService } from '../../../../core/services/socket-service/video-socket.service';

@Component({
  selector: 'app-customer-landing-page',
  imports: [CommonModule, CustomerHeaderComponent, RouterOutlet, CustomerFooterComponent],
  templateUrl: './customer-layout-page.component.html',
})
export class CustomerLayoutPageComponent implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly _chatSocket = inject(ChatSocketService);
  private readonly _videoSocket = inject(VideoCallSocketService);

  private _destroy$ = new Subject<void>();

  showSubscriptionPage$ = this._store.select(selectShowSubscriptionPage);

  ngOnInit(): void {
    const authStatus$ = this._store.select(selectCheckStatus).pipe(
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    );

    // Connect socket when authenticated
    authStatus$.pipe(
      filter(status => status === 'authenticated')
    ).subscribe(() => {
      this._chatSocket.connect();
      this._videoSocket.connect();
    });

    // Disconnect socket when unauthenticated
    authStatus$.pipe(
      filter(status => status !== 'authenticated')
    ).subscribe(() => {
      this._chatSocket.disconnect();
      this._videoSocket.disconnect();

    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._chatSocket.stopListeningMessages();
  }

  proceedWithSub() {
    this._store.dispatch(authActions.updateShowSubscriptionPageValue({ value: false }));
  }
}
