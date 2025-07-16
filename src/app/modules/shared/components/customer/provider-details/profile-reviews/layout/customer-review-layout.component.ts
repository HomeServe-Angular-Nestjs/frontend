import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { map, Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { CustomerReviewListComponent } from "../customer-reviews/customer-provider-profile-review.component";
import { CustomerLeaveAReviewComponent } from "../leave-a-review/leave-a-review.component";
import { selectCustomerReviewStatus } from "../../../../../../../store/customer/customer.selector";

@Component({
    selector: 'app-customer-review-layout',
    templateUrl: './customer-review-layout.component.html',
    imports: [CommonModule, CustomerReviewListComponent, CustomerLeaveAReviewComponent]
})
export class CustomerReviewLayoutComponent {
    private readonly _store = inject(Store);

    canSubmitReview$: Observable<boolean> = this._store.select(selectCustomerReviewStatus)
        .pipe(map(value => value ? !value : false));
}