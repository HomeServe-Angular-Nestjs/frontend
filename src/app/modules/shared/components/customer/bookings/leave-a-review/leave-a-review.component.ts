import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ISubmitReview } from "../../../../../../core/models/reviews.model";
import { getValidationMessage } from "../../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { IReview } from "../../../../../../core/models/booking.model";

@Component({
    selector: 'app-customer-leave-a-review',
    templateUrl: './leave-a-review.component.html',
    imports: [CommonModule, ReactiveFormsModule]
})
export class CustomerLeaveAReviewComponent implements OnChanges {
    private readonly _fb = inject(FormBuilder);
    private readonly _toastr = inject(ToastNotificationService);

    @Input() review: IReview | null = null;
    @Output() closeModalEvent = new EventEmitter<void>();
    @Output() submitModalEvent = new EventEmitter<ISubmitReview>();

    selectedRating = 0;
    stars = Array(5).fill(0);

    reviewForm: FormGroup = this._fb.group({
        desc: ['', Validators.required],
        ratings: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['review'] && this.review) {
            this.selectedRating = this.review.rating;
            this.reviewForm.patchValue({
                desc: this.review.desc,
                ratings: this.review.rating
            });
        }
    }

    setRating(rating: number): void {
        this.selectedRating = rating;
        this.reviewForm.patchValue({ ratings: this.selectedRating });
    }

    onSubmit(): void {
        this.reviewForm.markAllAsTouched(); 

        const controls = {
            desc: this.reviewForm.get('desc'),
            ratings: this.reviewForm.get('ratings')
        }

        if (this.reviewForm.valid) {

            this.submitModalEvent.emit({
                description: controls.desc?.value as string,
                ratings: controls.ratings?.value as number,
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