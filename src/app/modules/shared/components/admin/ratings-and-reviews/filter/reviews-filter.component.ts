import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IReviewFilters } from "../../../../../../core/models/reviews.model";

@Component({
    selector: 'app-admin-reviews-filter',
    templateUrl: './reviews-filter.component.html',
    imports: [CommonModule, FormsModule]
})
export class AdminReviewsFilterComponent {
    @Output() filtersChanged = new EventEmitter<IReviewFilters>();

    public reviewFilter: IReviewFilters = {
        minRating: "0",
        sortBy: 'latest',
        search: '',
        searchBy: 'review id'
    };

    onFilterChange() {
        this.filtersChanged.emit(this.reviewFilter);
    }

    resetFilters() {
        this.reviewFilter = {
            minRating: '0',
            sortBy: 'latest',
            search: '',
            searchBy: 'review id'
        };
        this.filtersChanged.emit({ ...this.reviewFilter });
    }
}