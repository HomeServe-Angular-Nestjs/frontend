import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
export class CustomerReviewListComponent implements OnInit, OnDestroy {
  private readonly _route = inject(ActivatedRoute);
  private readonly _providerService = inject(ProviderService);

  private _destroy$ = new Subject<void>();

  private _reviewResponse$ = new BehaviorSubject<IDisplayReviews | null>(null);
  reviewResponse$ = this._reviewResponse$.asObservable();
  providerId: string | null = null;
  isLoading = true;
  isLoadingMore = false;
  loadError = false;

  ngOnInit() {
    this._route.parent!.paramMap.pipe(
      takeUntil(this._destroy$),
      map(param => param.get('id')),
      filter((providerId): providerId is string => !!providerId),
      tap((providerId) => this.providerId = providerId),
      switchMap(providerId => this._fetchReviews(providerId, null))
    ).subscribe({
      next: (reviews) => {
        this._reviewResponse$.next(reviews);
        this.isLoading = false;
        this.loadError = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = true;
      }
    });
  }

  retryLoad() {
    if (!this.providerId) return;
    this.isLoading = true;
    this.loadError = false;
    this._fetchReviews(this.providerId, null)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (reviews) => {
          this._reviewResponse$.next(reviews);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.loadError = true;
        }
      });
  }

  loadMoreReviews() {
    const providerId = this.providerId;
    if (!providerId || this.isLoadingMore) return;

    const currentReviews = this._reviewResponse$.value;
    if (!currentReviews?.nextCursor || currentReviews.allFetched) return;

    this.isLoadingMore = true;
    this._fetchReviews(providerId, currentReviews.nextCursor)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (next) => {
          const current = this._reviewResponse$.value;
          if (!next || !current) return;

          this._reviewResponse$.next({
            reviews: [...current.reviews, ...next.reviews],
            avgRating: next.avgRating,
            totalReviews: next.totalReviews,
            allFetched: next.allFetched,
            nextCursor: next.nextCursor,
          });
        },
        complete: () => {
          this.isLoadingMore = false;
        }
      });
  }

  private _fetchReviews(providerId: string, cursor: string | null) {
    return this._providerService.getReviews(providerId, cursor).pipe(
      map(response => response.data ?? null)
    );
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
