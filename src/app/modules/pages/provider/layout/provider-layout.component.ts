import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ProviderSidebarComponent } from '../../../shared/partials/sections/provider/sidebar/provider-sidebar.component';
import { ProviderHeaderComponent } from "../../../shared/partials/sections/provider/header/provider-header.component";
import { ChatSocketService } from '../../../../core/services/socket-service/chat.service';
import { selectCheckStatus, selectShowSubscriptionPage } from '../../../../store/auth/auth.selector';
import { ProviderSubscriptionPage } from "../../subscription/plans/subscription-plan.component";
import { authActions } from '../../../../store/auth/auth.actions';
import { IPlan } from '../../../../core/models/plan.model';
import { PaymentService } from '../../../../core/services/payment.service';
import { RazorpayWrapperService } from '../../../../core/services/public/razorpay-wrapper.service';
import { RazorpayOrder, RazorpayPaymentResponse } from '../../../../core/models/payment.model';
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';
import { ITransaction } from '../../../../core/models/transaction.model';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { ICreateSubscription } from '../../../../core/models/subscription.model';
import { TransactionStatus, TransactionType } from '../../../../core/enums/enums';
import { getStartTimeAndEndTime } from '../../../../core/utils/date.util';
import { subscriptionAction } from '../../../../store/subscriptions/subscription.action';

@Component({
  selector: 'app-provider-layout',
  templateUrl: './provider-layout.component.html',
  styleUrl: './provider-layout.component.scss',
  imports: [CommonModule, ProviderSidebarComponent, RouterOutlet, ProviderHeaderComponent, ProviderSubscriptionPage],
  providers: [PaymentService, RazorpayWrapperService],
})
export class ProviderLayoutComponent implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly _chatSocket = inject(ChatSocketService);
  private readonly _paymentService = inject(PaymentService);
  private readonly _razorpayWrapper = inject(RazorpayWrapperService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _subscriptionService = inject(SubscriptionService);
  private readonly _router = inject(Router);

  private _destroy$ = new Subject<void>();

  showSubscriptionPage$ = this._store.select(selectShowSubscriptionPage);

  ngOnInit(): void {
    this._store.select(selectCheckStatus).pipe(
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(status => {
      if (status === 'authenticated') {
        this._chatSocket.stopListeningMessages();
        this._chatSocket.connect();
      } else {
        this._chatSocket.disconnect();
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _initializePayment(plan: IPlan) {
    this._paymentService.createRazorpayOrder(Number(plan.price)).subscribe({
      next: (order: RazorpayOrder) => {
        this._razorpayWrapper.openCheckout(order,
          (paymentResponse: RazorpayPaymentResponse) => this._verifyPaymentAndConfirmSubscription(paymentResponse, order, plan),
          () => this._toastr.warning('payment dismissed')
        );
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  private _verifyPaymentAndConfirmSubscription(response: RazorpayPaymentResponse, order: RazorpayOrder, plan: IPlan) {
    const orderData: RazorpayOrder = {
      id: order.id,
      transactionType: TransactionType.SUBSCRIPTION,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      method: 'debit',
      receipt: order.receipt,
      offer_id: order.offer_id,
      created_at: order.created_at,
    };

    this._paymentService.verifyPaymentSignature(response, orderData, 'provider').subscribe({
      next: (response) => {
        if (response.verified && response.transaction.id) {
          this._saveSubscription(response.transaction, plan);
        } else {
          this._toastr.error('Payment verification failed');
        }
      },
      error: (err) => {
        console.error(err);
        this._toastr.error('Server verification failed.')
      }
    })
  }

  private _saveSubscription(transactionData: ITransaction, plan: IPlan) {
    const subscriptionData: ICreateSubscription = {
      planId: plan.id,
      transactionId: transactionData.id,
      name: plan.name,
      duration: plan.duration !== 'lifetime' ? plan.duration : 'monthly',
      role: plan.role,
      features: plan.features,
      paymentStatus: TransactionStatus.PAID,
      ...getStartTimeAndEndTime(plan.duration),
    };

    this._subscriptionService.createSubscription(subscriptionData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._store.dispatch(subscriptionAction.subscriptionSuccessAction({ selectedSubscription: response.data }));
          this._store.dispatch(authActions.updateShowSubscriptionPageValue({ value: false }));
          this._router.navigate(['provider', 'dashboard']);
        } else {
          this._store.dispatch(subscriptionAction.subscriptionFailedAction({ error: response.message }));
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  proceedWithSub(selectedPlan: IPlan) {
    if (selectedPlan.name === 'free') {
      this._store.dispatch(authActions.updateShowSubscriptionPageValue({ value: false }));
      this._router.navigate(['provider', 'dashboard']);
      return;
    }

    this._initializePayment(selectedPlan);
  }
}
