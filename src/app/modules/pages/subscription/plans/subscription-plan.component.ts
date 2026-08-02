import { CommonModule, KeyValuePipe } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Router } from "@angular/router";
import { selectAuthUserType } from "../../../../store/auth/auth.selector";
import { catchError, combineLatest, filter, map, Observable, of, pairwise, shareReplay, Subject, switchMap, takeUntil, throwError } from "rxjs";
import { FEATURE_REGISTRY, IPlan } from "../../../../core/models/plan.model";
import { PlanService } from "../../../../core/services/plans.service";
import { PaymentService } from "../../../../core/services/payment.service";
import { RazorpayWrapperService } from "../../../../core/services/public/razorpay-wrapper.service";
import { ToastNotificationService } from "../../../../core/services/public/toastr.service";
import { SubscriptionService } from "../../../../core/services/subscription.service";
import { ISubscriptionOrder, RazorpayOrder, RazorpayPaymentResponse } from "../../../../core/models/payment.model";
import { ICreateSubscription, ISubscription } from "../../../../core/models/subscription.model";
import { PaymentDirection, PaymentSource, PlanDuration, TransactionStatus, TransactionType } from "../../../../core/enums/enums";
import { SharedDataService } from "../../../../core/services/public/shared-data.service";

interface PlanBenefit {
  icon: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-subscription-plan-page',
  templateUrl: './subscription-plan.component.html',
  imports: [CommonModule, KeyValuePipe],
  providers: [PaymentService, RazorpayWrapperService]
})
export class ProviderSubscriptionPlansPage implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);
  private readonly _planService = inject(PlanService);
  private readonly _sharedService = inject(SharedDataService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _razorpayWrapper = inject(RazorpayWrapperService);
  private readonly _subscriptionService = inject(SubscriptionService);
  private readonly _paymentService = inject(PaymentService);

  readonly featureRegistry = FEATURE_REGISTRY;

  getFeatureLabel(key: string): string {
    const feature = Object.values(this.featureRegistry).find(f => f.key === key);
    return feature ? feature.label : key;
  }

  private _destroy$ = new Subject<void>();

  userType = 'customer';
  plans$!: Observable<IPlan[]>;
  currentPlanId: string | null = null;
  renewPlanId: string | null = null;
  previousPage: string | null = null;
  currentPlanDuration: string = '';
  currentSubscription$: Observable<ISubscription | null> = of(null);
  latestSubscription$: Observable<ISubscription | null> = of(null);

  ngOnInit(): void {
    this._sharedService.setProviderHeader('Plans');

    this.currentSubscription$ = this._subscriptionService.fetchSubscription().pipe(
      map(res => res.data ?? null),
      shareReplay(1)
    );

    this.latestSubscription$ = this._subscriptionService.fetchLatestSubscription().pipe(
      map(res => res.data ?? null),
      shareReplay(1)
    );

    const allPlans$ = this._planService.fetchPlans().pipe(
      map(res => res.data ?? []),
      shareReplay(1)
    );

    const userType$ = this._store.select(selectAuthUserType);

    this.plans$ = combineLatest([userType$, allPlans$, this.currentSubscription$, this.latestSubscription$]).pipe(
      takeUntil(this._destroy$),
      map(([userType, plans, subscription, latest]) => {
        this.userType = userType ?? 'customer';
        const hasActiveCurrent = !!subscription && !this.isExpired(subscription);
        this.currentPlanId = hasActiveCurrent ? subscription.planId : null;
        this.currentPlanDuration = hasActiveCurrent ? (subscription.duration ?? '') : '';
        this.renewPlanId = latest && this.isExpired(latest) ? latest.planId : null;

        return plans.filter(plan => {
          const isRoleMatched = plan.role.toLowerCase() === this.userType.toLowerCase();
          const isLifetimeConflict = !!this.currentPlanId && plan.duration.toLowerCase() === PlanDuration.LIFETIME;
          return isRoleMatched && !isLifetimeConflict;
        });
      }),
      shareReplay(1)
    );

    this._sharedService.providerHeader$
      .pipe(pairwise(), takeUntil(this._destroy$))
      .subscribe(([previous]) => {
        this.previousPage = previous;
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _verifyPaymentAndConfirmSubscription(
    response: RazorpayPaymentResponse,
    order: RazorpayOrder,
    subscriptionId: string
  ) {
    const orderData: ISubscriptionOrder = {
      id: order.id,
      subscriptionId,
      transactionType: TransactionType.SUBSCRIPTION_PAYMENT,
      amount: order.amount,
      status: TransactionStatus.SUCCESS,
      direction: PaymentDirection.DEBIT,
      source: PaymentSource.RAZORPAY,
      receipt: order.receipt,
    };

    return this._paymentService.verifySubscriptionPayment(response, orderData).pipe(
      switchMap((verificationResponse) => {
        const { verified, transaction } = verificationResponse;

        if (!transaction || !transaction.id || !verified) {
          this._toastr.error('Payment verification failed or transaction missing.');
          return throwError(() => new Error('Payment verification failed'));
        }
        return of(void 0);
      })
    );
  }

  private _openRazorPayCheckout(order: RazorpayOrder, subscriptionId: string): Observable<'success' | 'dismissed'> {
    return new Observable<'success' | 'dismissed'>(observer => {
      this._razorpayWrapper.openCheckout(
        order,"","","",
        (paymentResponse: RazorpayPaymentResponse) => {
          this._verifyPaymentAndConfirmSubscription(paymentResponse, order, subscriptionId)
            .subscribe({
              next: () => {
                observer.next('success');
                observer.complete();
              },
              error: (err) => {
                observer.error(err)
              }
            });
        },
        () => {
          this._subscriptionService.removeSubscription(subscriptionId)
            .pipe(
              catchError(err => {
                console.error('Failed to remove subscription after dismissal', err);
                return of(null);
              })
            )
            .subscribe(() => {
              this._paymentService.unlockPayment().pipe(takeUntil(this._destroy$)).subscribe();
              observer.next('dismissed');
              observer.complete();
            })
        }
      )
    });
  }

  private _afterSuccessfulSubscription() {
    this._toastr.success('Payment verified. Subscription completed.');
    let url = this.userType == 'customer'
      ? '/subscription'
      : '/provider/subscriptions'
    this._router.navigate([url]);
  }

  private _initializePayment(plan: IPlan) {
    const subscriptionData: ICreateSubscription = {
      planId: plan.id,
      duration: plan.duration,
    };

    return this._subscriptionService.createSubscription(subscriptionData).pipe(
      takeUntil(this._destroy$),
      switchMap((subscriptionResponse) => {
        const sub = subscriptionResponse?.data;
        if (!sub?.id) throw new Error('Failed to purchase subscription.');

        return this._paymentService.createRazorpayOrder(Number(plan.price)).pipe(
          switchMap(order => this._openRazorPayCheckout(order, sub.id))
        );
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  private _initializeUpgrade(amount: number, plan: IPlan): Observable<'success' | 'dismissed'> {
    const subscriptionData: ICreateSubscription = {
      planId: plan.id,
      duration: plan.duration,
    };

    return this._subscriptionService.upgradeSubscription(subscriptionData).pipe(
      takeUntil(this._destroy$),
      switchMap(res => {
        let sub = res.data;
        if (!sub || !sub.id) throw new Error('Failed to upgrade subscription.');

        return this._paymentService.createRazorpayOrder(amount).pipe(
          switchMap(order => this._openRazorPayCheckout(order, sub.id))
        )
      }),
      catchError(err => {
        this._toastr.error('Something went wrong during upgrade.');
        return throwError(() => err);
      })
    );
  }

  private _handleFreePlan() {
    const url = this.userType === 'provider' ? ['provider', 'dashboard'] : ['homepage'];
    this._router.navigate(url);
  }

  private _handleUpgrade(plan: IPlan): Observable<'success' | 'dismissed'> {
    return this.currentSubscription$
      .pipe(
        takeUntil(this._destroy$),
        filter(Boolean),
        switchMap(subscription => this._subscriptionService.getUpgradeAmount(subscription.id)),
        map(res => res.data),
        filter(Boolean),
        switchMap(({ upgradeAmount, creditAmount, monthlyPrice, yearlyPrice }) => {
          const confirmed = confirm(
            `Upgrade to Yearly Plan\n\n` +
            `Yearly price: ₹${yearlyPrice}\n` +
            `Monthly paid: ₹${monthlyPrice}\n` +
            `Prorated credit: ₹${creditAmount.toFixed(2)}\n\n` +
            `Amount due: ₹${upgradeAmount}\n\n` +
            `Your current monthly plan stays active until the payment is confirmed.`
          );

          if (!confirmed) {
            return of('dismissed' as const);
          }

          return this._initializeUpgrade(upgradeAmount, plan);
        }),
        catchError(err => {
          this._toastr.error('Upgrade failed.');
          return throwError(() => err);
        })
      );
  }

  proceedSub(plan: IPlan): void {
    if (plan.duration === PlanDuration.LIFETIME) {
      this._handleFreePlan();
      return;
    }

    if (this.currentPlanDuration === PlanDuration.YEARLY) {
      this._toastr.warning('You are a yearly subscriber. Transitions are locked until your current term expires.');
      return;
    }

    const isUpgrade = this.currentPlanDuration === PlanDuration.MONTHLY && plan.duration === PlanDuration.YEARLY;
    const flow$ = isUpgrade
      ? this._handleUpgrade(plan)
      : this._initializePayment(plan);

    flow$.pipe(takeUntil(this._destroy$)).subscribe({
      next: (status) => {
        if (status === "success") {
          this._afterSuccessfulSubscription();
        } else if (status === "dismissed") {
          this._toastr.info('Payment dismissed.');
        }
      },
      error: (err) => {
        console.error('Subscription payment flow failed', err);
        this._toastr.error('Something went wrong. Please try again.');
      },
    });
  }

  goBack() {
    if (this.previousPage === 'Subscription') {
      this._router.navigate(['/provider/subscriptions']);
    } else {
      this._router.navigate(['/provider/dashboard']);
    }
  }

  isCurrentPlan(plan: any): boolean {
    return this.currentPlanId === plan.id;
  }

  isYearly(): boolean {
    return this.currentPlanDuration === 'yearly';
  }

  isExpired(sub: ISubscription | null): boolean {
    return !!sub && !!sub.endDate && new Date(sub.endDate).getTime() < Date.now();
  }

  isRenewalPlan(plan: any): boolean {
    return !!this.renewPlanId && this.renewPlanId === plan.id;
  }

  // Get the appropriate plan button text based on conditions
  getPlanButtonText(plan: any): string {
    if (this.isRenewalPlan(plan)) {
      return 'Renew ' + (plan.duration || '').toString();
    }

    const planDuration = plan.duration?.toLowerCase();

    if (this.currentPlanDuration === PlanDuration.MONTHLY && planDuration === PlanDuration.YEARLY) {
      return 'Upgrade to Yearly';
    }

    if (planDuration === PlanDuration.LIFETIME) {
      return 'Get Started';
    }

    if (!this.currentPlanId) {
      return 'Choose ' + plan.duration;
    }

    return 'Upgrade to ' + (plan.duration || '').toString();
  }

  getPlanTagline(plan: any): string {
    const name = plan.name?.toLowerCase();
    const yearly = plan.duration?.toLowerCase() === 'yearly';

    if (name === 'free') {
      return 'Everything you need to get started — at no cost.';
    }

    if (yearly) {
      return this.userType === 'provider'
        ? 'Full provider toolkit, billed once a year — best value.'
        : 'Full premium experience, billed once a year — best value.';
    }

    return this.userType === 'provider'
      ? 'Grow your business with premium provider tools.'
      : 'Elevate every booking with premium customer benefits.';
  }

  getPerMonthPrice(plan: any): number {
    return Math.round((plan.price || 0) / 12);
  }

  getSavingsPercent(plans: IPlan[], plan: any): number {
    const monthly = plans.find(
      p => p.name === plan.name && p.duration?.toLowerCase() === 'monthly'
    );
    if (!monthly || !monthly.price) return 0;

    return Math.round((1 - plan.price / (monthly.price * 12)) * 100);
  }

  getBenefits(): PlanBenefit[] {
    if (this.userType === 'provider') {
      return [
        {
          icon: 'fa-chart-line',
          title: 'Data-driven growth',
          desc: 'Track bookings, revenue and ratings with your full analytics dashboard.',
        },
        {
          icon: 'fa-magnifying-glass',
          title: 'More visibility',
          desc: 'Rank higher in search results with priority service listing placement.',
        },
        {
          icon: 'fa-headset',
          title: '24/7 support',
          desc: 'Dedicated support whenever you need it — day or night.',
        },
      ];
    }

    return [
      {
        icon: 'fa-bolt',
        title: 'Priority matching',
        desc: 'Get matched with top-rated professionals before other customers.',
      },
      {
        icon: 'fa-calendar-check',
        title: 'Priority booking',
        desc: 'Book the best pros faster with priority slots and quicker responses.',
      },
      {
        icon: 'fa-headset',
        title: '24/7 support',
        desc: 'Dedicated support whenever you need it — day or night.',
      },
    ];
  }

  scrollToPlans(): void {
    const grid = document.getElementById('plans-grid');
    grid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

}
