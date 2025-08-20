import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { ICustomer } from "../../../../../../core/models/user.model";
import { Store } from "@ngrx/store";
import { selectCustomer } from "../../../../../../store/customer/customer.selector";

@Component({
    selector: 'app-customer-profile-overview',
    templateUrl: './profile-overview.component.html',
    imports: [CommonModule]
})
export class CustomerProfileOverviewComponent implements OnInit {
    private readonly _store = inject(Store);

    customer$: Observable<ICustomer | null> = this._store.select(selectCustomer);
    isLoading = true;

    ngOnInit(): void {
        this.customer$.subscribe(customer => {
            if (customer) {
                this.isLoading = false;
            }
        });
    }

    onImageError(event: Event) {
        (event.target as HTMLImageElement).src = 'assets/images/profile_placeholder.jpg';
    }

}