import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IProviderOverviewCardBox, OverviewCardData } from '../../../../../../core/models/dashboard.model';

@Component({
  selector: 'app-provider-overview-cards',
  imports: [CommonModule],
  templateUrl: './overview-cards.component.html',
})
export class ProviderOverviewCardsComponent {
  @Input() data!: OverviewCardData;
  @Output() detailsClicked = new EventEmitter<void>();

  onViewDetails() {
    this.detailsClicked.emit();
    // Optionally handle link/callback routing here
  }

  formatValue(value: string | number): string | number {
    if (typeof value === 'number' && !isNaN(value)) {
      if (value > 1000) return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
      return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }
    return value;
  }
}
