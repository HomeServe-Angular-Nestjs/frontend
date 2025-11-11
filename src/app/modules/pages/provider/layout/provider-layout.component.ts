import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ProviderSidebarComponent } from '../../../shared/partials/sections/provider/sidebar/provider-sidebar.component';
import { ProviderHeaderComponent } from "../../../shared/partials/sections/provider/header/provider-header.component";
import { ChatSocketService } from '../../../../core/services/socket-service/chat.service';
import { selectCheckStatus } from '../../../../store/auth/auth.selector';
import { PaymentService } from '../../../../core/services/payment.service';
import { RazorpayWrapperService } from '../../../../core/services/public/razorpay-wrapper.service';
import { VideoCallSocketService } from '../../../../core/services/socket-service/video-socket.service';
import { VideoCallService } from '../../../../core/services/video-call.service';

@Component({
  selector: 'app-provider-layout',
  templateUrl: './provider-layout.component.html',
  styleUrl: './provider-layout.component.scss',
  imports: [CommonModule, ProviderSidebarComponent, RouterOutlet, ProviderHeaderComponent],
  providers: [PaymentService, RazorpayWrapperService],
})
export class ProviderLayoutComponent implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly _videoSocketService = inject(VideoCallSocketService);
  private readonly _chatSocket = inject(ChatSocketService);
  private readonly _videoCallService = inject(VideoCallService); //? initiated the instance


  private _destroy$ = new Subject<void>();

  ngOnInit(): void {
    this._store.select(selectCheckStatus).pipe(
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(status => {
      if (status === 'authenticated') {
        this._chatSocket.stopListeningMessages();
        this._chatSocket.connect();
        this._videoSocketService.connect();
      } else {
        this._chatSocket.disconnect();
        this._videoSocketService.disconnect();
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }


}
