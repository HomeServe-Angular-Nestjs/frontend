import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProvider } from '../../../../../store/models/user.model';

@Component({
  selector: 'app-customer-provider-view-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-provider-view-card.component.html',
})
export class CustomerProviderViewCardComponent {
  @Input({ required: true }) providers!: IProvider[];

  searchQuery = '';
  certifiedOnly = true;
  ratingFilter = 0;
  priceFilter = 'all';
  sortOption = 'rating';

  filteredProviders: IProvider[] = [];

  ngOnInit() {
    // this.filterProviders();
  }

  filterProviders() {
    this.filteredProviders = this.providers.filter((provider: IProvider) => {
      // Search filter
      const matchesSearch = provider.fullname
        ? provider.fullname.toLowerCase().includes(this.searchQuery.toLowerCase())
        : provider.username.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Certified filter
      const matchesCertified = !this.certifiedOnly || provider.isCertified;

      // Rating filter
      // const matchesRating = provider.rating >= this.ratingFilter;

      //     // Price filter
      //     let matchesPrice = true;
      //     if (this.priceFilter === '0-50') {
      //       matchesPrice = provider.price <= 50;
      //     } else if (this.priceFilter === '50-100') {
      //       matchesPrice = provider.price > 50 && provider.price <= 100;
      //     } else if (this.priceFilter === '100+') {
      //       matchesPrice = provider.price > 100;
      //     }

      return matchesSearch && matchesCertified;
    });
    //   // this.sortProviders();
  }

  sortProviders() {
    if (this.sortOption === 'rating') {
      // this.filteredProviders.sort((a, b) => b.rating - a.rating);
    } else if (this.sortOption === 'price') {
      // this.filteredProviders.sort((a, b) => a.price - b.price);
    } else if (this.sortOption === 'distance') {
      // this.filteredProviders.sort((a, b) => a.distance - b.distance);
    }
  }

  toggleFavorite(provider: IProvider) {
    provider.isActive = !provider.isActive;
  }

  viewProvider(provider: IProvider) {
    // Implement navigation to provider details
    console.log('Viewing provider:', provider.fullname);
  }
}
