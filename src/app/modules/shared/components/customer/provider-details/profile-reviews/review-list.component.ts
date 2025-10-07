import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, filter, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { ActivatedRoute } from '@angular/router';
import { IDisplayReviews } from '../../../../../../core/models/user.model';
import { ButtonComponent } from "../../../../../../UI/button/button.component";

@Component({
  selector: 'app-customer-reviews-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './review-list.component.html',
})
export class CustomerReviewListComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _providerService = inject(ProviderService);

  private _destroy$ = new Subject<void>();

  private _reviewResponse$ = new BehaviorSubject<IDisplayReviews | null>(null);
  reviewResponse$ = this._reviewResponse$.asObservable();
  providerId: string | null = null;

  ngOnInit() {
    this._route.parent!.paramMap.pipe(
      takeUntil(this._destroy$),
      map(param => param.get('id')),
      filter((providerId): providerId is string => !!providerId),
      tap((providerId) => this.providerId = providerId),
      switchMap(providerId => this._providerService.getReviews(providerId).pipe(
        map(response => response.data ?? null)
      ))
    ).subscribe(reviews => this._reviewResponse$.next(reviews));
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

  loadMoreReviews() {
    const providerId = this.providerId;
    if (!providerId) return;

    const currentReviews = this._reviewResponse$.value;
    if (currentReviews?.allFetched) return;
    const currentCount = currentReviews?.reviews?.length ?? 0;

    this._providerService.getReviews(providerId, currentCount)
      .pipe(
        takeUntil(this._destroy$),
        map(response => response.data ?? null)
      )
      .subscribe(reviews => this._reviewResponse$.next(reviews));
  }
}
