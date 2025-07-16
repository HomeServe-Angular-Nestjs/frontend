import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IReview } from '../../../../../../../core/models/reviews.model';
import { BehaviorSubject, filter, map, Observable, switchMap } from 'rxjs';
import { ProviderService } from '../../../../../../../core/services/provider.service';
import { ActivatedRoute } from '@angular/router';
import { IDisplayReviews } from '../../../../../../../core/models/user.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-customer-reviews-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-provider-profile-review.component.html',
})
export class CustomerReviewListComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _providerService = inject(ProviderService);

  reviews$ = new BehaviorSubject<IDisplayReviews[]>([]);

  ngOnInit() {
    this._route.parent!.paramMap.pipe(
      map(param => param.get('id')),
      filter((providerId): providerId is string => !!providerId),
      switchMap(providerId => this._providerService.getReviews(providerId).pipe(
        map(response => {
          if (response.success && response.data) {
            return [...response.data].sort((a, b) =>
              new Date(b.writtenAt).getTime() - new Date(a.writtenAt).getTime());
          }
          return [];
        })
      ))
    ).subscribe(reviews => this.reviews$.next(reviews));
  }

  sortOption: string = 'Most Recent';
  filterRating: number | null = null;



  setSort(option: string) {
    this.sortOption = option;
  }

  setFilter(rating: string) {
    this.filterRating = rating === 'All Ratings' ? null : parseInt(rating[0], 10);
  }

  getTotalAvgRating(reviews: IDisplayReviews[]) {
    return reviews.reduce((sum, r) => sum + r.avgRating, 0) / reviews.length || 0;
  }

  addReview(newReview: IDisplayReviews) {
    const current = this.reviews$.getValue();
    this.reviews$.next(
      [...current, newReview].sort((a, b) =>
        new Date(b.writtenAt).getTime() - new Date(a.writtenAt).getTime()
      )
    );
  }
}
