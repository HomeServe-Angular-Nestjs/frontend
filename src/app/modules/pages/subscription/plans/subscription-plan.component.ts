import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { Router } from "@angular/router";
import { selectAuthUserType } from "../../../../store/auth/auth.selector";
import { catchError, combineLatest, filter, map, mapTo, Observable, of, pairwise, shareReplay, Subject, switchMap, takeUntil, tap, throwError } from "rxjs";
import { IPlan } from "../../../../core/models/plan.model";
import { PlanService } from "../../../../core/services/plans.service";
import { CapitalizeFirstPipe } from "../../../../core/pipes/capitalize-first.pipe";
import { PaymentService } from "../../../../core/services/payment.service";
import { RazorpayWrapperService } from "../../../../core/services/public/razorpay-wrapper.service";
import { ToastNotificationService } from "../../../../core/services/public/toastr.service";
import { SubscriptionService } from "../../../../core/services/subscription.service";
import { ISubscriptionOrder, RazorpayOrder, RazorpayPaymentResponse } from "../../../../core/models/payment.model";
import { ICreateSubscription, ISubscription } from "../../../../core/models/subscription.model";
import { PaymentDirection, PaymentSource, PaymentStatus, PlanDuration, TransactionStatus, TransactionType } from "../../../../core/enums/enums";
import { getStartTimeAndEndTime } from "../../../../core/utils/date.util";
import { SharedDataService } from "../../../../core/services/public/shared-data.service";

@Component({
    selector: 'app-subscription-plan-page',
    templateUrl: './subscription-plan.component.html',
    imports: [CommonModule, CapitalizeFirstPipe]
})
export class ProviderSubscriptionPlansPage implements OnInit, OnDestroy {
    private readonly _store = inject(Store);
    private readonly _router = inject(Router);
    private readonly _planService = inject(PlanService);
    private readonly _paymentService = inject(PaymentService);
    private readonly _sharedService = inject(SharedDataService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _razorpayWrapper = inject(RazorpayWrapperService);
    private readonly _subscriptionService = inject(SubscriptionService);

    private _destroy$ = new Subject<void>();

    @Output() proceedSubEvent = new EventEmitter<IPlan>();

    userType = 'customer';
    plans$!: Observable<IPlan[]>;
    currentPlanId: string | null = null;
    previousPage: string | null = null;
    currentPlanDuration: string = '';
    currentSubscription$: Observable<ISubscription | null> = of(null);

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Plans');

        this.currentSubscription$ = this._subscriptionService.fetchSubscription().pipe(
            map(res => res.data ?? null),
            shareReplay(1)
        );

        const allPlans$ = this._planService.fetchPlans().pipe(
            map(res => res.data ?? []),
            shareReplay(1)
        );

        const userType$ = this._store.select(selectAuthUserType);

        this.plans$ = combineLatest([userType$, allPlans$, this.currentSubscription$]).pipe(
            takeUntil(this._destroy$),
            map(([userType, plans, subscription]) => {
                this.userType = userType ?? 'customer';
                this.currentPlanId = subscription?.planId ?? null;
                this.currentPlanDuration = subscription?.duration ?? '';

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
            transactionType: TransactionType.SUBSCRIPTION,
            amount: order.amount,
            status: TransactionStatus.SUCCESS,
            direction: PaymentDirection.DEBIT,
            source: PaymentSource.RAZORPAY,
            receipt: order.receipt,
        };

        return this._paymentService.verifySubscriptionPayment(response, orderData).pipe(
            switchMap((verificationResponse) => {
                const { verified, subscriptionId, transaction } = verificationResponse;

                if (!transaction || !subscriptionId || !transaction.id || !verified) {
                    this._toastr.error('Payment verification failed or transaction missing.');
                    return throwError(() => new Error('Payment verification failed'));
                }
                return this._subscriptionService.updatePaymentStatus({
                    transactionId: transaction.id,
                    subscriptionId,
                    paymentStatus: PaymentStatus.PAID
                });
            }));
    }

    private _openRazorPayCheckout(order: RazorpayOrder, subscriptionId: string): Observable<void> {
        return new Observable<void>(observer => {
            this._razorpayWrapper.openCheckout(
                order,
                (paymentResponse: RazorpayPaymentResponse) => {
                    this._verifyPaymentAndConfirmSubscription(paymentResponse, order, subscriptionId)
                        .subscribe({
                            next: () => {
                                observer.next();
                                observer.complete();
                            },
                            error: (err) => observer.error(err)
                        });
                },
                () => {
                    this._toastr.warning('Payment dismissed');
                    observer.complete();
                    // !toto- remove subscription doc when payment failed.
                }
            )
        });
    }

    private _afterSuccessfulSubscription() {
        this._toastr.success('Payment verified. Subscription completed.');
        this._router.navigate(['/provider/subscriptions']);
    }

    private _initializePayment(plan: IPlan) {
        const subscriptionData: ICreateSubscription = {
            planId: plan.id,
            transactionId: null,
            name: plan.name,
            duration: plan.duration,
            role: plan.role,
            features: plan.features,
            price: plan.price,
            paymentStatus: PaymentStatus.UNPAID,
            ...getStartTimeAndEndTime(plan.duration),
        };

        return this._subscriptionService.createSubscription(subscriptionData).pipe(
            takeUntil(this._destroy$),
            switchMap((subscriptionResponse) => {
                const sub = subscriptionResponse?.data;
                if (!sub?.id) throw new Error('Failed to confirm subscription.');

                return this._paymentService.createRazorpayOrder(Number(plan.price)).pipe(
                    switchMap(order => this._openRazorPayCheckout(order, sub.id))
                );
            }),
            catchError(err => {
                this._toastr.error('Something went wrong during upgrade.');
                return throwError(() => err);
            })
        );
    }

    private _initializeUpgrade(amount: number, plan: IPlan) {
        const subscriptionData: ICreateSubscription = {
            planId: plan.id,
            transactionId: null,
            name: plan.name,
            duration: plan.duration,
            role: plan.role,
            features: plan.features,
            price: amount,
            paymentStatus: PaymentStatus.UNPAID,
            ...getStartTimeAndEndTime(plan.duration),
        };

        return this._subscriptionService.upgradeSubscription(subscriptionData).pipe(
            takeUntil(this._destroy$),
            switchMap(res => {
                let sub = res.data;
                if (!sub || !sub.id) throw new Error('Failed to create subscription.');

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
        this._router.navigate(['provider', 'dashboard']);
    }

    private _handleUpgrade(plan: IPlan): Observable<void> {
        return this.currentSubscription$
            .pipe(
                takeUntil(this._destroy$),
                filter(Boolean),
                switchMap(subscription => this._subscriptionService.getUpgradeAmount(subscription.id)),
                map(res => res.data),
                filter(Boolean),
                switchMap((amount) => this._initializeUpgrade(amount, plan).pipe(
                    map(() => void 0)
                )),
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

        const isUpgrade = this.currentPlanDuration === PlanDuration.MONTHLY;

        const flow$ = isUpgrade
            ? this._handleUpgrade(plan)
            : this._initializePayment(plan);

        flow$.subscribe({
            next: () => this._afterSuccessfulSubscription(),
            error: (err) => this._toastr.error(err.message || 'Subscription failed'),
        });
    }

    getPlanButtonClass(plan: any): string {
        const planName = plan.name?.toLowerCase();
        const isCurrent = this.currentPlanId === plan.id;

        if (isCurrent) {
            return 'bg-gray-300 text-gray-600 border border-gray-400 cursor-not-allowed';
        }

        switch (planName) {
            case 'free':
                return 'bg-primary-50 text-primary-700 border border-primary-200 font-semibold';
            case 'premium':
                return 'bg-green-100 text-green-800 border border-green-400 hover:bg-green-200';
            default:
                return 'bg-gray-200 text-black border border-gray-300';
        }
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

    // Get the appropriate plan button text based on conditions
    getPlanButtonText(plan: any): string {
        const planDuration = plan.duration?.toLowerCase();

        if (this.currentPlanDuration === PlanDuration.MONTHLY && planDuration === PlanDuration.YEARLY) {
            return 'Upgrade to Yearly';
        }

        if (planDuration === PlanDuration.LIFETIME) {
            return 'Get Started';
        }

        return 'Upgrade to ' + (plan.duration || '').toString();
    }

}