import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, filter, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { ActivatedRoute } from '@angular/router';
import { IDisplayReviews } from '../../../../../../core/models/user.model';
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { ReportModalComponent } from '../../../../partials/shared/report-modal/report-modal.component';
import { IReportSubmit, ReportService } from '../../../../../../core/services/report.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';

@Component({
  selector: 'app-customer-reviews-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ReportModalComponent],
  templateUrl: './review-list.component.html',
})
export class CustomerReviewListComponent implements OnInit, OnDestroy {
  private readonly _route = inject(ActivatedRoute);
  private readonly _providerService = inject(ProviderService);
  private readonly _reportService = inject(ReportService);
  private readonly _toastr = inject(ToastNotificationService);

  private _destroy$ = new Subject<void>();

  private _reviewResponse$ = new BehaviorSubject<IDisplayReviews | null>(null);
  reviewResponse$ = this._reviewResponse$.asObservable();
  providerId: string | null = null;
  isLoading = true;
  isLoadingMore = false;
  loadError = false;
  openReportModal = false;
  reportedReviewId: string | null = null;

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

  reportReview(reviewId: string) {
    if (!reviewId) return;
    this.reportedReviewId = reviewId;
    this.openReportModal = true;
  }

  submitReviewReport(report: Omit<IReportSubmit, 'targetId'>) {
    if (!this.reportedReviewId) return;

    const reportData: IReportSubmit = {
      ...report,
      targetId: this.reportedReviewId,
    };

    this._reportService.submit(reportData).subscribe({
      next: (res) => {
        if (res.success) {
          this._toastr.success('Review report has been submitted.');
        } else {
          this._toastr.error('Failed to submit review report.');
        }
      },
      complete: () => {
        this.openReportModal = false;
        this.reportedReviewId = null;
      }
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
