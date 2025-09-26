import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ISubscription } from "../../../../core/models/subscription.model";
import { Store } from "@ngrx/store";
import { combineLatest, Observable, Subject, takeUntil } from "rxjs";
import { selectAuthUserType} from "../../../../store/auth/auth.selector";
import { CapitalizeFirstPipe } from "../../../../core/pipes/capitalize-first.pipe";
import { Router, RouterLink } from "@angular/router";
import { SharedDataService } from "../../../../core/services/public/shared-data.service";

@Component({
    selector: 'app-subscription-view-page',
    templateUrl: './subscription-view.component.html',
    imports: [CommonModule, CapitalizeFirstPipe, RouterLink]
})
export class ProviderViewSubscriptionPage implements OnInit, OnDestroy {
    private readonly _store = inject(Store);
    private readonly _sharedService = inject(SharedDataService);
    private readonly _router = inject(Router);

    private _destroy$ = new Subject<void>();

    subscription$!: Observable<ISubscription | null>;
    userType = 'customer';

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Subscription');

        // this._store.dispatch(subscriptionAction.fetchSubscriptions());
        // this.subscription$ = this._store.select(selectSelectedSubscription).pipe(takeUntil(this._destroy$));
        // const isSubscriptionPageRendered$ = this._store.select(selectShowSubscriptionPage).pipe(takeUntil(this._destroy$));

        this._store.select(selectAuthUserType).pipe(
            takeUntil(this._destroy$)
        ).subscribe(type => {
            if (type) this.userType = type;
        });

        // combineLatest([this.subscription$, isSubscriptionPageRendered$]).subscribe(([subscription]) => {
        //     if (!subscription) this._router.navigate(['/provider/plans']);
        // });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    cancelPlan(): void {
        // Logic to navigate to plan comparison or selection
    }

    toggleRenewalType(event: Event) { }
}