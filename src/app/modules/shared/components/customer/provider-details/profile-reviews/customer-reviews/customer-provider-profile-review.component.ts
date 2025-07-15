import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IReview } from '../../../../../../../core/models/reviews.model';

@Component({
  selector: 'app-customer-reviews-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-provider-profile-review.component.html',
})
export class CustomerReviewListComponent {
  @Input() reviews: IReview[] = [];

  sortOption: string = 'Most Recent';
  filterRating: number | null = null;

  get filteredReviews(): IReview[] {
    let sorted = [...this.reviews];

    if (this.sortOption === 'Highest Rated') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (this.sortOption === 'Lowest Rated') {
      sorted.sort((a, b) => a.rating - b.rating);
    } else {
      sorted.sort((a, b) => new Date(b.writtenAt).getTime() - new Date(a.writtenAt).getTime());
    }

    if (this.filterRating) {
      return sorted.filter(r => Math.floor(r.rating) === this.filterRating);
    }

    return sorted;
  }

  setSort(option: string) {
    this.sortOption = option;
  }

  setFilter(rating: string) {
    this.filterRating = rating === 'All Ratings' ? null : parseInt(rating[0], 10);
  }
}
