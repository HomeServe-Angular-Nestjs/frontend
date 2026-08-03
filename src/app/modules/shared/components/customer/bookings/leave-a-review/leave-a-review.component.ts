import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
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
    @Input() providerName: string = '';
    @Output() closeModalEvent = new EventEmitter<void>();
    @Output() submitModalEvent = new EventEmitter<ISubmitReview>();

    selectedRating = 0;
    stars = Array(5).fill(0);
    isSubmitting = false;

    reviewForm: FormGroup = this._fb.group({
        desc: ['', Validators.required],
        ratings: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['review']) {
            const review = this.review;
            this.selectedRating = review?.rating ?? 0;
            this.reviewForm.reset({
                desc: review?.desc ?? '',
                ratings: review?.rating ?? 0
            });
        }
    }

    get isEditMode(): boolean {
        return !!this.review;
    }

    get descControl() {
        return this.reviewForm.get('desc');
    }

    get ratingsControl() {
        return this.reviewForm.get('ratings');
    }

    setRating(rating: number): void {
        if (this.isSubmitting) return;
        this.selectedRating = rating;
        this.reviewForm.patchValue({ ratings: this.selectedRating });
    }

    onSubmit(): void {
        if (this.isSubmitting) return;
        this.reviewForm.markAllAsTouched();

        const controls = {
            desc: this.descControl,
            ratings: this.ratingsControl
        };

        if (this.reviewForm.valid) {
            this.isSubmitting = true;
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
