import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ProviderSidebarComponent } from '../../../shared/partials/sections/provider/sidebar/provider-sidebar.component';
import { ProviderHeaderComponent } from "../../../shared/partials/sections/provider/header/provider-header.component";
import { ChatSocketService } from '../../../../core/services/socket-service/chat.service';
import { selectCheckStatus, selectShowSubscriptionPage } from '../../../../store/auth/auth.selector';
import { ProviderSubscriptionPage } from "../../subscription/subscription.component";
import { authActions } from '../../../../store/auth/auth.actions';
import { IPlan, PlanDurationType } from '../../../../core/models/plan.model';
import { PaymentService } from '../../../../core/services/payment.service';
import { RazorpayWrapperService } from '../../../../core/services/public/razorpay-wrapper.service';
import { RazorpayOrder, RazorpayPaymentResponse } from '../../../../core/models/payment.model';
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';
import { ITransaction } from '../../../../core/models/transaction.model';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { ICreateSubscription } from '../../../../core/models/subscription.model';
import { PaymentStatus, TransactionStatus, TransactionType } from '../../../../core/enums/enums';
import { getStartTimeAndEndTime } from '../../../../core/utils/date.util';

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
  private readonly _subscriptionService = inject(SubscriptionService)

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
      this._chatSocket.stopListeningMessages();
    });

    // Disconnect socket when unauthenticated
    authStatus$.pipe(
      filter(status => status !== 'authenticated')
    ).subscribe(() => {
      this._chatSocket.disconnect();
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _initializePayment(plan: IPlan) {
    this._paymentService.createRazorpayOrder(Number(plan.price)).subscribe({
      next: (order: RazorpayOrder) => {
        console.log(order);
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
        console.log(response)
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
        console.log(response)
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  proceedWithSub(selectedPlan: IPlan) {
    console.log(selectedPlan);
    if (selectedPlan.name === 'free') {
      this._store.dispatch(authActions.updateShowSubscriptionPageValue({ value: false }));
      return;
    }

    this._initializePayment(selectedPlan);
  }
}
