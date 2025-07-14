import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { selectAuthUserType } from "../../../../store/auth/auth.selector";
import { combineLatest, map, Observable, shareReplay } from "rxjs";
import { IPlan } from "../../../../core/models/plan.model";
import { PlanService } from "../../../../core/services/plans.service";
import { CapitalizeFirstPipe } from "../../../../core/pipes/capitalize-first.pipe";

@Component({
    selector: 'app-subscription-plan-page',
    templateUrl: './subscription-plan.component.html',
    imports: [CommonModule, CapitalizeFirstPipe]
})
export class ProviderSubscriptionPage implements OnInit {
    private readonly _store = inject(Store);
    private readonly _planService = inject(PlanService);

    @Output() proceedSubEvent = new EventEmitter<IPlan>();

    userType = 'customer';
    plans$!: Observable<IPlan[]>;

    ngOnInit(): void {
        const userType$ = this._store.select(selectAuthUserType);
        const allPlans$ = this._planService.fetchPlans();


        this.plans$ = combineLatest([userType$, allPlans$]).pipe(
            map(([userType, response]) => {
                this.userType = userType ?? 'customer';
                return (response.data || []).filter(plan => plan.role === userType);
            }),
            shareReplay(1)
        );
    }

    proceedSub(plan: IPlan) {
        this.proceedSubEvent.emit(plan);
    }
}