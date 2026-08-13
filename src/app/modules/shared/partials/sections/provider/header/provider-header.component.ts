import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { selectTotalUnReadNotificationCount } from '../../../../../../store/notification/notification.selector';
import { notificationAction } from '../../../../../../store/notification/notification.action';

interface ISearchItem {
  name: string;
  route: string[];
}

@Component({
  selector: 'app-provider-header',
  templateUrl: './provider-header.component.html',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
})
export class ProviderHeaderComponent implements OnInit, OnDestroy {
  private readonly _sharedService = inject(SharedDataService);
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);
  private _destroy$ = new Subject<void>();

  readonly providerHeader$ = this._sharedService.providerHeader$
    .pipe(takeUntil(this._destroy$));

  readonly unreadCount$ = this._store.select(selectTotalUnReadNotificationCount);

  readonly searchControl = new FormControl('');
  searchOpen = false;
  selectedIndex = 0;

  private readonly _searchItems: ISearchItem[] = [
    { name: 'Dashboard', route: ['provider', 'dashboard'] },
    { name: 'Manage Services', route: ['provider', 'manage-services'] },
    { name: 'Availability', route: ['provider', 'availability'] },
    { name: 'Schedules', route: ['provider', 'schedules'] },
    { name: 'Bookings', route: ['provider', 'bookings'] },
    { name: 'Chat / Messages', route: ['provider', 'chat'] },
    { name: 'Performance', route: ['provider', 'performance'] },
    { name: 'Revenue Analytics', route: ['provider', 'revenue-analytics'] },
    { name: 'Area Analytics', route: ['provider', 'area-analytics'] },
    { name: 'Reviews', route: ['provider', 'reviews'] },
    { name: 'Wallet', route: ['provider', 'wallet'] },
    { name: 'Profile', route: ['provider', 'profiles', 'overview'] },
    { name: 'Accounts', route: ['provider', 'profiles', 'accounts'] },
    { name: 'Notifications', route: ['provider', 'notifications'] },
  ];

  get filteredResults(): ISearchItem[] {
    const query = (this.searchControl.value ?? '').trim().toLowerCase();
    if (!query) return [];
    return this._searchItems.filter(item => item.name.toLowerCase().includes(query));
  }

  ngOnInit(): void {
    this._store.dispatch(notificationAction.fetchAllNotifications());
  }

  onSearchFocus(): void {
    this.searchOpen = true;
    this.selectedIndex = 0;
  }

  onSearchInput(): void {
    this.searchOpen = true;
    this.selectedIndex = 0;
  }

  navigateToSearchItem(): void {
    const results = this.filteredResults;
    const item = results[this.selectedIndex];
    if (item) {
      this._router.navigate(item.route);
      this.closeSearch();
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const results = this.filteredResults;
    if (results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % results.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + results.length) % results.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.navigateToSearchItem();
    } else if (event.key === 'Escape') {
      this.closeSearch();
    }
  }

  selectSearchItem(index: number): void {
    this.selectedIndex = index;
  }

  closeSearch(): void {
    this.searchOpen = false;
    this.searchControl.setValue('');
    this.selectedIndex = 0;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
