import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { combineLatest, Subject, switchMap, takeUntil } from 'rxjs';
import { BookingService } from '../../../../core/services/booking.service';
import { CommonModule } from '@angular/common';
import { ProviderPaginationComponent } from '../../../shared/partials/sections/provider/pagination/provider-pagination.component';
import { IReviewDetails, IReviewFilter } from '../../../../core/models/reviews.model';
import { FormsModule } from '@angular/forms';
import { DebounceService } from '../../../../core/services/public/debounce.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { SharedDataService } from '../../../../core/services/public/shared-data.service';

@Component({
  selector: 'app-provider-review',
  imports: [CommonModule, ProviderPaginationComponent, FormsModule],
  providers: [DebounceService],
  templateUrl: './review.component.html',
})
export class ProviderReviewComponent implements OnInit, OnDestroy {
  private readonly _sharedService = inject(SharedDataService);
  private readonly _bookingService = inject(BookingService);
  private readonly _debounceService = inject(DebounceService);

  private _destroy$ = new Subject<void>();

  filter = signal<IReviewFilter>({
    rating: 'all',
    search: '',
    sort: 'desc',
    time: 'all'
  });

  page = signal(1);

  dataSignal = toSignal(
    combineLatest([
      toObservable(this.page),
      toObservable(this.filter)
    ]).pipe(
      switchMap(([page, filter]) => this._bookingService.getReviewData(page, filter))
    ),
    { initialValue: null }
  );

  reviews = computed(() => this.dataSignal()?.data?.reviewDetails ?? []);

  pagination = computed(() => {
    const pag = this.dataSignal()?.data?.pagination;
    return pag ?? { page: 1, limit: 10, total: 0 };
  });

  ngOnInit(): void {
    this._sharedService.setProviderHeader('Reviews');

    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe(value => {
        this.filter.update(f => ({ ...f, search: value }));
        this.page.set(1);
      });
  }

  onSearch(term: string) {
    this._debounceService.delay(term);
  }

  applyFilter() {
    this.page.set(1);
    this.filter.update(f => ({ ...f }));
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
  }

  updateRating(value: any) {
    this.filter.update(f => ({ ...f, rating: value }));
    this.page.set(1);
  }

  updateTime(value: any) {
    this.filter.update(f => ({ ...f, time: value }));
    this.page.set(1);
  }

  updateSort(value: any) {
    this.filter.update(f => ({ ...f, sort: value }));
    this.page.set(1);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
