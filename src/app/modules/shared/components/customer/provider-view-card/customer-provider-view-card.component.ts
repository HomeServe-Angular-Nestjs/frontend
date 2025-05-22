import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProvider } from '../../../../../core/models/user.model';
import { Router } from '@angular/router';
import { getColorFromChar } from '../../../../../core/utils/style.utils';

@Component({
  selector: 'app-customer-provider-view-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-provider-view-card.component.html',
})
export class CustomerProviderViewCardComponent {
  private router = inject(Router);

  @Input({ required: true }) providers!: IProvider[];
  fallbackChar: string = '';

  toggleFavorite(provider: IProvider) {
    provider.isActive = !provider.isActive;
  }

  fallbackColor(text: string) {
    this.fallbackChar = text.charAt(0).toUpperCase();
    return getColorFromChar(text.charAt(0));
  }

  viewProvider(providerId: string) {
    this.router.navigate(['provider_details', providerId, 'services']);
  }
}
