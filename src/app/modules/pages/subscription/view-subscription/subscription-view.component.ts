import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ISubscription } from "../../../../core/models/subscription.model";
import { Store } from "@ngrx/store";
import { Observable, Subject, takeUntil } from "rxjs";
import { selectAuthUserType } from "../../../../store/auth/auth.selector";
import { selectSelectedSubscription } from "../../../../store/subscriptions/subscription.selector";
import { subscriptionAction } from "../../../../store/subscriptions/subscription.action";
import { CapitalizeFirstPipe } from "../../../../core/pipes/capitalize-first.pipe";

@Component({
    selector: 'app-subscription-view-page',
    templateUrl: './subscription-view.component.html',
    imports: [CommonModule, CapitalizeFirstPipe]
})
export class ProviderViewSubscriptionPage implements OnInit, OnDestroy {
    private readonly _store = inject(Store);

    private _destroy$ = new Subject<void>();

    subscription$!: Observable<ISubscription | null>;
    userType = 'customer';

    ngOnInit(): void {
        this._store.dispatch(subscriptionAction.fetchSubscriptions());
        this.subscription$ = this._store.select(selectSelectedSubscription);

        this._store.select(selectAuthUserType).pipe(
            takeUntil(this._destroy$)
        ).subscribe(type => {
            if (type) {
                this.userType = type;
            }
        });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onUpgrade(): void {
        // Logic to navigate to upgrade
    }

    onShowPlans(): void {
        // Logic to navigate to plan comparison or selection
    }

    toggleRenewalType(event: Event) { }


}