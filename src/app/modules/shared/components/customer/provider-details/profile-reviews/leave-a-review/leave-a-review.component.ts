import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { selectAuthUserId } from "../../../../../../../store/auth/auth.selector";
import { getValidationMessage } from "../../../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../../../core/services/public/toastr.service";
import { ISubmitReview } from "../../../../../../../core/models/reviews.model";
import { CustomerService } from "../../../../../../../core/services/customer.service";
import { customerActions } from "../../../../../../../store/customer/customer.actions";
import { selectCustomerReviewStatus } from "../../../../../../../store/customer/customer.selector";
import { map, Observable } from "rxjs";

@Component({
    selector: 'app-customer-leave-a-review',
    templateUrl: './leave-a-review.component.html',
    imports: [CommonModule, ReactiveFormsModule]
})
export class CustomerLeaveAReviewComponent implements OnInit {
    private readonly _fb = inject(FormBuilder);
    private readonly _route = inject(ActivatedRoute);
    private readonly _store = inject(Store);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _customerService = inject(CustomerService);

    selectedRating = 0;
    stars = Array(5).fill(0);

    reviewForm: FormGroup = this._fb.group({
        providerId: ['', Validators.required],
        desc: ['', Validators.required],
        ratings: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });

    ngOnInit() {
        this._route.parent?.params.subscribe(params => {
            const providerId = params['id'];
            if (providerId) {
                this.reviewForm.patchValue({ providerId })
            }
        });
    }

    setRating(rating: number): void {
        this.selectedRating = rating;
        this.reviewForm.patchValue({ ratings: this.selectedRating });
    }

    onSubmit(): void {
        this.reviewForm.markAllAsTouched();

        const controls = {
            providerId: this.reviewForm.get('providerId'),
            desc: this.reviewForm.get('desc'),
            ratings: this.reviewForm.get('ratings')
        }

        if (this.reviewForm.valid) {
            const reviewData: ISubmitReview = {
                providerId: controls.providerId?.value,
                desc: controls.desc?.value,
                ratings: Number(controls.ratings?.value),
            };

            this._customerService.submitReview(reviewData).subscribe({
                next: (res) => {
                    this._store.dispatch(customerActions.changeReviewedStatus({ status: true }))
                    this.reviewForm.reset({ isReported: false });
                    this.selectedRating = 0;
                },
                error: (err) => {
                    console.error(err);
                    this._toastr.error(err);
                }
            });
        } else {
            for (const [key, control] of Object.entries(controls)) {
                const message = getValidationMessage(control, key);
                if (message) {
                    this._toastr.error(message);
                    return;
                }
            }
        }
    }
}