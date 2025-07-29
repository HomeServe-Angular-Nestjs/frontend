import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { Router } from "@angular/router";
import { selectAuthUserType } from "../../../../store/auth/auth.selector";
import { combineLatest, filter, map, Observable, of, pairwise, shareReplay, Subject, switchMap, takeUntil } from "rxjs";
import { IPlan } from "../../../../core/models/plan.model";
import { PlanService } from "../../../../core/services/plans.service";
import { CapitalizeFirstPipe } from "../../../../core/pipes/capitalize-first.pipe";
import { PaymentService } from "../../../../core/services/payment.service";
import { RazorpayWrapperService } from "../../../../core/services/public/razorpay-wrapper.service";
import { ToastNotificationService } from "../../../../core/services/public/toastr.service";
import { SubscriptionService } from "../../../../core/services/subscription.service";
import { RazorpayOrder, RazorpayPaymentResponse } from "../../../../core/models/payment.model";
import { ITransaction } from "../../../../core/models/transaction.model";
import { ICreateSubscription, ISubscription } from "../../../../core/models/subscription.model";
import { PlanDuration, TransactionStatus, TransactionType } from "../../../../core/enums/enums";
import { getStartTimeAndEndTime } from "../../../../core/utils/date.util";
import { subscriptionAction } from "../../../../store/subscriptions/subscription.action";
import { authActions } from "../../../../store/auth/auth.actions";
import { selectSelectedSubscription } from "../../../../store/subscriptions/subscription.selector";
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

        this._store.dispatch(subscriptionAction.fetchSubscriptions());
        const userType$ = this._store.select(selectAuthUserType);
        const allPlans$ = this._planService.fetchPlans();
        this.currentSubscription$ = this._store.select(selectSelectedSubscription);

        this.plans$ = combineLatest([userType$, allPlans$, this.currentSubscription$]).pipe(
            map(([userType, planResponse, subscription]) => {
                this.userType = userType ?? 'customer';
                this.currentPlanId = subscription?.planId ?? null;
                this.currentPlanDuration = subscription?.duration ?? '';

                return (planResponse.data || []).filter(plan => {
                    const matchedUser = plan.role.toLowerCase() === this.userType.toLowerCase();
                    const isSubscriptionAlreadyExist = !!this.currentPlanId && plan.duration.toLowerCase() === PlanDuration.LIFETIME;

                    return matchedUser && !isSubscriptionAlreadyExist;
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
        });
    }

    private _verifyPaymentAndConfirmSubscription(response: RazorpayPaymentResponse, order: RazorpayOrder, plan: IPlan, isUpgrade: boolean = false) {
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
                    this._saveSubscription(response.transaction, plan, isUpgrade);
                } else {
                    this._toastr.error('Payment verification failed');
                }
            },
            error: (err) => {
                console.error(err);
                this._toastr.error('Server verification failed.')
            }
        });
    }

    private _saveSubscription(transactionData: ITransaction, plan: IPlan, isUpgrade: boolean) {
        const subscriptionData: ICreateSubscription = {
            planId: plan.id,
            transactionId: transactionData.id,
            name: plan.name,
            duration: plan.duration !== PlanDuration.LIFETIME ? plan.duration : PlanDuration.MONTHLY,
            role: plan.role,
            features: plan.features,
            price: plan.price,
            paymentStatus: TransactionStatus.PAID,
            ...getStartTimeAndEndTime(plan.duration),
        };

        if (isUpgrade) {
            this._subscriptionService.upgradeSubscription(subscriptionData).subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this._afterSuccessfulSubscription(response.data);
                    } else {
                        this._store.dispatch(subscriptionAction.subscriptionFailedAction({ error: response.message }));
                    }
                },
                error: (err) => {
                    console.error(err);
                }
            });
        } else {
            this._subscriptionService.createSubscription(subscriptionData).subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this._afterSuccessfulSubscription(response.data);
                    } else {
                        this._store.dispatch(subscriptionAction.subscriptionFailedAction({ error: response.message }));
                    }
                },
                error: (err) => {
                    console.error(err);
                }
            });
        }
    }

    private _afterSuccessfulSubscription(newSubscription: ISubscription) {
        this._store.dispatch(subscriptionAction.subscriptionSuccessAction({ selectedSubscription: newSubscription }));
        this._router.navigate(['/provider/subscriptions']);
    }

    private _initializeUpgrade(amount: number, plan: IPlan) {
        this._paymentService.createRazorpayOrder(amount).subscribe({
            next: (order) => {
                this._razorpayWrapper.openCheckout(order,
                    (paymentResponse: RazorpayPaymentResponse) => this._verifyPaymentAndConfirmSubscription(paymentResponse, order, plan,),
                    () => this._toastr.warning('payment dismissed')
                );
            },
            error: (err) => {
                console.error(err);
            }
        })
    }

    private _handleFreePlan() {
        this._store.dispatch(authActions.updateShowSubscriptionPageValue({ value: false }));
        this._router.navigate(['provider', 'dashboard']);
    }

    private _handleUpgrade(plan: IPlan) {
        this.currentSubscription$
            .pipe(
                takeUntil(this._destroy$),
                filter(Boolean),
                switchMap(subscription => this._subscriptionService.getUpgradeAmount(subscription.id)),
                map(res => res.data),
                filter(Boolean)
            ).subscribe(upgradeAmount => {
                this._initializeUpgrade(upgradeAmount, plan);
            });
    }

    proceedSub(plan: IPlan): void {
        if (plan.duration === PlanDuration.LIFETIME) return this._handleFreePlan();
        const isUpgrade = this.currentPlanDuration === PlanDuration.MONTHLY;

        if (isUpgrade) {
            console.log('yoo');
            this._handleUpgrade(plan);
        } else {
            this._initializePayment(plan);
        }
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
        this._store.dispatch(authActions.updateShowSubscriptionPageValue({ value: false }));

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