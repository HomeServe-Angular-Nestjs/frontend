import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
  imports: [FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent {
  searchTerm: string = '';
  selectedDate: string = '';
  selectedStatus: string = '';
  selectedRole: 'customer' | 'provider' = 'customer';

  @Output() filtersApplied = new EventEmitter<any>();
  @Output() roleChanged = new EventEmitter<'customer' | 'provider'>();

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

  applyFilters() {
    const filters = {
      searchTerm: this.searchTerm,
      date: this.selectedDate,
      status: this.selectedStatus,
      role: this.selectedRole
    };
    this.filtersApplied.emit(filters);
  }
}
