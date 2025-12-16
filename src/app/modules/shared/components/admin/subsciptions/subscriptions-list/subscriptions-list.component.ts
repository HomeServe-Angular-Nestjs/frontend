import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { SubscriptionService } from '../../../../../../core/services/subscription.service';
import { IAdminSubscriptionList, ISubscriptionFilters } from '../../../../../../core/models/subscription.model';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';
import { AdminPaginationComponent } from "../../../../partials/sections/admin/pagination/pagination.component";
import { SubscriptionFiltersComponent } from "../subscription-filters/subscription-filters.component";
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../partials/shared/confirm-dialog-box/confirm-dialog.component';

@Component({
  selector: 'app-admin-subscriptions-list',
  templateUrl: './subscriptions-list.component.html',
  imports: [CommonModule, AdminPaginationComponent, SubscriptionFiltersComponent],

})
export class AdminSubscriptionsListComponent implements OnInit, OnDestroy {
  private readonly _subscriptionService = inject(SubscriptionService);
  private readonly _sharedService = inject(SharedDataService);
  private readonly _dialog = inject(MatDialog);
  private readonly _destroy$ = new Subject<void>();

  columns: string[] = ['subscriptionId', 'user', 'plan', 'amount', 'status', 'payment', 'expires', 'renewal', 'actions'];

  filters = signal<ISubscriptionFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
    payment: 'all',
    duration: 'all',
  });

  query = computed(() => ({
    ...this.filters(),
  }));

  dataSignal = toSignal(
    toObservable(this.query).pipe(
      switchMap((query) => this._subscriptionService.fetchSubscriptionLists(query)),
    ),
    { initialValue: null }
  );

  subscriptions = computed(() => {
    const response = this.dataSignal();
    return response?.data?.subscriptions || [];
  });

  pagination = computed(() => {
    const response = this.dataSignal();
    return response?.data?.pagination || {
      page: 1,
      limit: 10,
      total: 1,
    };
  });

  ngOnInit(): void {
    this._sharedService.setAdminHeader('Subscriptions & Plans');
  }

  applyFilters(filters: ISubscriptionFilters) {
    this.filters.update(f => ({ ...f, ...filters, page: 1 }));
  }

  changePage(page: number) {
    this.filters.update(f => ({ ...f, page }));
  }

  updateSubscriptionStatus(event: Event, sub: IAdminSubscriptionList) {
    const checkbox = event.target as HTMLInputElement;
    checkbox.checked = sub.isActive;

    this._openDialogBox('Are you sure you want to update this subscription status?', 'Confirm Update').afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this._subscriptionService.updateSubscriptionStatus(sub.subscriptionId, !sub.isActive)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            if (res.success) {
              sub.isActive = !sub.isActive;
            }
          }
        });
    });
  }

  private _openDialogBox(message: string, title: string) {
    return this._dialog.open(ConfirmDialogComponent, {
      data: { title, message },
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
