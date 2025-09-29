import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ISubscription } from "../../../../core/models/subscription.model";
import { Store } from "@ngrx/store";
import { map, Observable, Subject, takeUntil } from "rxjs";
import { selectAuthUserType } from "../../../../store/auth/auth.selector";
import { CapitalizeFirstPipe } from "../../../../core/pipes/capitalize-first.pipe";
import { RouterLink } from "@angular/router";
import { SharedDataService } from "../../../../core/services/public/shared-data.service";
import { SubscriptionService } from "../../../../core/services/subscription.service";

@Component({
    selector: 'app-subscription-view-page',
    templateUrl: './subscription-view.component.html',
    imports: [CommonModule, CapitalizeFirstPipe, RouterLink]
})
export class ProviderViewSubscriptionPage implements OnInit, OnDestroy {
    private readonly _subscriptionService = inject(SubscriptionService);
    private readonly _sharedService = inject(SharedDataService);
    private readonly _store = inject(Store);

    private _destroy$ = new Subject<void>();

    subscription$!: Observable<ISubscription | null>;
    userType = 'customer';
    ngOnInit(): void {

        this._sharedService.setProviderHeader('Subscription');

        this.subscription$ = this._subscriptionService.fetchSubscription().pipe(
            map(res => res.data || null)
        );

        this._store.select(selectAuthUserType)
            .pipe(takeUntil(this._destroy$))
            .subscribe(type => this.userType = type === 'provider'
                ? 'provider'
                : 'customer'
            );
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}