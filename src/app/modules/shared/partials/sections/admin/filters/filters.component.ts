import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IFilter, ToggleType } from '../../../../../../core/models/filter.model';

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

  onSearchTriggered() {
    this._debounceService.delay(this.searchTerm);
  }

  setRole(role: 'customer' | 'provider'): void {
    this.selectedRole = role;
    this.roleChanged.emit(role);
  }

  changeStatus(status: ToggleType): void {
    this.selectedStatus = status;
    this._emitFilters();
  }

  changeDate(): void {
    this._emitFilters();
  }

  private _emitFilters(): void {
    const filter: IFilter = {
      search: this.searchTerm,
      status: this.selectedStatus,
      date: this.selectedDate
    };

    this._filters$.next(filter);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
