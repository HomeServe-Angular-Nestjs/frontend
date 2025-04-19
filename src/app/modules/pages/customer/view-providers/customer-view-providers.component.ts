import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { FormsModule } from '@angular/forms';

interface Provider {
  id: number;
  name: string;
  avatar: string;
  certified: boolean;
  rating: number;
  reviews: number;
  price: number;
  experience: number;
  distance: number;
  availableToday: boolean;
  specialOffer: boolean;
  fastResponse: boolean;
  isFavorite: boolean;
}

@Component({
  selector: 'app-customer-view-providers',
  standalone: true,
  imports: [CommonModule, CustomerBreadcrumbsComponent,FormsModule],
  templateUrl: './customer-view-providers.component.html',
})
export class CustomerViewProvidersComponent {
  searchQuery = '';
  certifiedOnly = true;
  ratingFilter = 0;
  priceFilter = 'all';
  sortOption = 'rating';

  providers: Provider[] = [
    {
      id: 1,
      name: 'John Smith',
      avatar: '/assets/images/providers/provider1.jpg',
      certified: true,
      rating: 4.5,
      reviews: 128,
      price: 50,
      experience: 5,
      distance: 2.5,
      availableToday: true,
      specialOffer: true,
      fastResponse: false,
      isFavorite: false
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      avatar: '/assets/images/providers/provider2.jpg',
      certified: true,
      rating: 4.8,
      reviews: 245,
      price: 65,
      experience: 7,
      distance: 1.8,
      availableToday: true,
      specialOffer: false,
      fastResponse: true,
      isFavorite: true
    },
    {
      id: 3,
      name: 'Michael Brown',
      avatar: '/assets/images/providers/provider3.jpg',
      certified: false,
      rating: 3.9,
      reviews: 87,
      price: 45,
      experience: 3,
      distance: 4.2,
      availableToday: false,
      specialOffer: true,
      fastResponse: false,
      isFavorite: false
    },
    {
      id: 4,
      name: 'Emily Davis',
      avatar: '/assets/images/providers/provider4.jpg',
      certified: true,
      rating: 4.7,
      reviews: 192,
      price: 75,
      experience: 6,
      distance: 3.1,
      availableToday: true,
      specialOffer: false,
      fastResponse: true,
      isFavorite: false
    },
    {
      id: 5,
      name: 'David Wilson',
      avatar: '/assets/images/providers/provider5.jpg',
      certified: true,
      rating: 4.2,
      reviews: 104,
      price: 55,
      experience: 4,
      distance: 5.7,
      availableToday: false,
      specialOffer: true,
      fastResponse: false,
      isFavorite: false
    },
    {
      id: 6,
      name: 'Jessica Lee',
      avatar: '/assets/images/providers/provider6.jpg',
      certified: true,
      rating: 4.9,
      reviews: 312,
      price: 85,
      experience: 8,
      distance: 1.2,
      availableToday: true,
      specialOffer: false,
      fastResponse: true,
      isFavorite: true
    }
  ];

  filteredProviders: Provider[] = [];

  ngOnInit() {
    this.filterProviders();
  }

  filterProviders() {
    this.filteredProviders = this.providers.filter(provider => {
      // Search filter
      const matchesSearch = provider.name.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Certified filter
      const matchesCertified = !this.certifiedOnly || provider.certified;

      // Rating filter
      const matchesRating = provider.rating >= this.ratingFilter;

      // Price filter
      let matchesPrice = true;
      if (this.priceFilter === '0-50') {
        matchesPrice = provider.price <= 50;
      } else if (this.priceFilter === '50-100') {
        matchesPrice = provider.price > 50 && provider.price <= 100;
      } else if (this.priceFilter === '100+') {
        matchesPrice = provider.price > 100;
      }

      return matchesSearch && matchesCertified && matchesRating && matchesPrice;
    });

    this.sortProviders();
  }

  sortProviders() {
    if (this.sortOption === 'rating') {
      this.filteredProviders.sort((a, b) => b.rating - a.rating);
    } else if (this.sortOption === 'price') {
      this.filteredProviders.sort((a, b) => a.price - b.price);
    } else if (this.sortOption === 'distance') {
      this.filteredProviders.sort((a, b) => a.distance - b.distance);
    }
  }

  toggleCertifiedOnly() {
    this.certifiedOnly = !this.certifiedOnly;
    this.filterProviders();
  }

  toggleFavorite(provider: Provider) {
    provider.isFavorite = !provider.isFavorite;
  }

  viewProvider(provider: Provider) {
    // Implement navigation to provider details
    console.log('Viewing provider:', provider.name);
  }

  resetFilters() {
    this.searchQuery = '';
    this.certifiedOnly = true;
    this.ratingFilter = 0;
    this.priceFilter = 'all';
    this.sortOption = 'rating';
    this.filterProviders();
  }
}
