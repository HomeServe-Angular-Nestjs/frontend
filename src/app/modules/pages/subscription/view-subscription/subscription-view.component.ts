import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ISubscription } from "../../../../core/models/subscription.model";
import { Store } from "@ngrx/store";
import { map, Observable, of, Subject, takeUntil } from "rxjs";
import { selectAuthUserType } from "../../../../store/auth/auth.selector";
import { Router } from "@angular/router";
import { SharedDataService } from "../../../../core/services/public/shared-data.service";
import { SubscriptionService } from "../../../../core/services/subscription.service";
import { FEATURE_REGISTRY } from "../../../../core/models/plan.model";

@Component({
    selector: 'app-subscription-view-page',
    templateUrl: './subscription-view.component.html',
    imports: [CommonModule]
})
export class ProviderViewSubscriptionPage implements OnInit, OnDestroy {
    private readonly _subscriptionService = inject(SubscriptionService);
    private readonly _sharedService = inject(SharedDataService);
    private readonly _router = inject(Router);
    private readonly _store = inject(Store);

    private _destroy$ = new Subject<void>();

    subscription$!: Observable<ISubscription | null>;
    history$!: Observable<ISubscription[]>;
    latest$!: Observable<ISubscription | null>;
    userType = 'customer';
    readonly featureRegistry = FEATURE_REGISTRY;

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Subscription');
        this._store.select(selectAuthUserType)
            .pipe(takeUntil(this._destroy$))
            .subscribe(type => this.userType = type === 'provider'
                ? 'provider'
                : 'customer'
            );

        this.subscription$ = this._getSubscription();
        this.history$ = this._subscriptionService.fetchSubscriptionHistory().pipe(
            map(res => (res.data ?? []).filter(sub => !sub.isActive))
        );
        this.latest$ = this._subscriptionService.fetchLatestSubscription().pipe(
            map(res => res.data ?? null)
        );
    }

    private _getSubscription(): Observable<ISubscription | null> {
        if (this._subscriptionService.getSubscription) {
            return of(this._subscriptionService.getSubscription);
        }

        return this._subscriptionService.fetchSubscription().pipe(
            map(res => res.data || null)
        );
    }

    navigateToPlans() {
        let url = this.userType === 'customer'
            ? 'plans'
            : 'provider/plans'
        this._router.navigate([url]);
    }

    getFeatureLabel(key: string): string {
        const feature = Object.values(this.featureRegistry).find(f => f.key === key);
        return feature ? feature.label : key;
    }

    getSubscriptionStatus(sub: ISubscription): 'active' | 'expired' | 'cancelled' {
        if (sub.isActive) return 'active';
        if (sub.endDate && new Date(sub.endDate).getTime() < Date.now()) return 'expired';
        return 'cancelled';
    }

    isExpired(sub: ISubscription | null): boolean {
        return !!sub && !!sub.endDate && new Date(sub.endDate).getTime() < Date.now();
    }

    getConversionInfo(sub: ISubscription) {
        const metadata = sub.metadata ?? {};
        if (!metadata['convertedFromDuration']) return null;

        return {
            fromDuration: metadata['convertedFromDuration'],
            creditAmount: metadata['creditAmount'] ?? 0,
            convertedAt: metadata['convertedAt'] ? new Date(metadata['convertedAt']) : null,
        };
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}