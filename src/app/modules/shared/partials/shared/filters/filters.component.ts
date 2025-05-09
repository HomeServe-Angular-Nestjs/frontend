import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DebounceService } from '../../../../../core/services/public/debounce.service';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { userActions } from '../../../../../store/users/user.actions';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
  imports: [FormsModule, CommonModule],
  providers: [DebounceService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FiltersComponent implements OnInit {
  private _store = inject(Store);
  private readonly _debounceService = inject(DebounceService);

  @Output() filterEvents = new EventEmitter<any>();
  @Output() roleChanged = new EventEmitter<'customer' | 'provider'>();

  private _destroy$ = new Subject<void>();

  searchTerm: string = '';
  selectedDate: string = '';
  selectedStatus: string = '';
  selectedRole: 'customer' | 'provider' = 'customer';

  ngOnInit(): void {
    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe((value: string) => {
        this._searchUserDispatch(this.selectedRole);
      })
  }

  onSearchTriggered() {
    this._debounceService.search(this.searchTerm);
  }


  setRole(role: 'customer' | 'provider') {
    this.selectedRole = role;
    this.roleChanged.emit(role);
  }

  getButtonClasses(role: string): string {
    const base = 'toggle-button';
    return role === this.selectedRole
      ? `${base} active`
      : `${base} inactive`;
  }

  private _searchUserDispatch(userType: 'customer' | 'provider') {
    if (userType === 'customer') {
      this._store.dispatch(userActions.searchCustomers({ searchTerm: this.searchTerm }));
    } else if (userType === 'provider') {
      this._store.dispatch(userActions.searchProviders({ searchTerm: this.searchTerm }));
    }
  }
}
