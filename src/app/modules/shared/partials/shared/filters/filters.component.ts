import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DebounceService } from '../../../../../core/services/public/debounce.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IFilter, ToggleType } from '../../../../../core/models/filter.model';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
  imports: [FormsModule, CommonModule],
  providers: [DebounceService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FiltersComponent implements OnInit, OnDestroy {
  private readonly _debounceService = inject(DebounceService);

  @Output() filterEvents = new EventEmitter<IFilter>();
  @Output() roleChanged = new EventEmitter<'customer' | 'provider'>();

  private _destroy$ = new Subject<void>();
  private _filters$ = new BehaviorSubject<IFilter>({});

  searchTerm: string = '';
  selectedDate: string = '';
  selectedStatus: ToggleType = 'all';
  selectedRole: 'customer' | 'provider' = 'customer';

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Subscribes to internal filters stream and search debounce stream to emit filter changes.
   */
  ngOnInit(): void {
    this._filters$
      .pipe(takeUntil(this._destroy$))
      .subscribe((filter) => {
        this.filterEvents.emit(filter);
      });

    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._emitFilters();
      });
  }

  /**
   * Triggers the debounce search mechanism when the search input changes.
   */
  onSearchTriggered() {
    this._debounceService.delay(this.searchTerm);
  }

  /**
   * Updates the selected role and emits a roleChanged event to notify parent components.
   * @param role 'customer' | 'provider'
   */
  setRole(role: 'customer' | 'provider'): void {
    this.selectedRole = role;
    this.roleChanged.emit(role);
  }

  /**
   * Updates the selected status (true, false, or 'all') and emits the new filter state.
   * @param status ToggleType - true for active, false for blocked, 'all' for no filter
   */
  changeStatus(status: ToggleType): void {
    this.selectedStatus = status;
    this._emitFilters();
  }


  /**
   * Emits the current filter values by pushing them into the filters BehaviorSubject.
   */
  private _emitFilters(): void {
    const filter: IFilter = {
      search: this.searchTerm,
      status: this.selectedStatus
    };

    this._filters$.next(filter);
  }

  /**
   * Lifecycle hook called when the component is destroyed.
   * Cleans up subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
