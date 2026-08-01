import { Component, inject, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { encode as base64Encode } from 'js-base64';
import { LocationService } from '../../../../../core/services/public/location.service';
import { DebounceService } from '../../../../../core/services/public/debounce.service';
import { ToastNotificationService } from '../../../../../core/services/public/toastr.service';
import { ISearchedLocation } from '../../../../../core/models/user.model';
import { ICustomerSearchCategories } from '../../../../../core/models/category.model';
import { CategoryService } from '../../../../../core/services/category.service';

@Component({
  selector: 'app-customer-explore-section',
  standalone: true,
  templateUrl: './customer-explore-section.component.html',
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [LocationService, DebounceService],
})
export class CustomerExploreSectionComponent {
  private readonly _locationService = inject(LocationService);
  private readonly _debounceService = inject(DebounceService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _categoryService = inject(CategoryService);
  private readonly _router = inject(Router);

  private _interval: any;

  serviceSearch: string = '';
  serviceCategories: ICustomerSearchCategories[] = [];
  isServiceSearchDropdownOpen = false;
  isServiceSearchLoading = false;
  selectedService?: ICustomerSearchCategories;

  locationData$ = new BehaviorSubject<ISearchedLocation[]>([]);
  locationSearch: string = '';
  isLocationSearchDropdownOpen = false;
  isLocationSearchLoading = false;
  loadingCurrentLocation = false;
  selectedLocation?: ISearchedLocation;

  currentSlide: number = 0;

  services = [
    {
      icon: 'fa-broom',
      title: 'Cleaning Services',
      description: 'Professional home cleaning',
      route: 'cleaning'
    },
    {
      icon: 'fa-wrench',
      title: 'Plumbing',
      description: 'Expert plumbing solutions',
      route: 'plumbing'
    },
    {
      icon: 'fa-bolt',
      title: 'Electrical',
      route: 'electrical',
      description: 'Electrical maintenance',
    },
    {
      icon: 'fa-paint-roller',
      route: 'painting',
      title: 'Painting',
      description: 'Interior & exterior painting'
    }
  ];


  images = [
    { src: 'assets/images/hero_image1.jpg', alt: 'Home Service 1' },
    { src: 'assets/images/hero_image2.jpg', alt: 'Home Service 2' },
    { src: 'assets/images/hero_image3.jpg', alt: 'Home Service 3' },
  ];

  ngOnInit() {
    this.startCarousel();

    this._debounceService.onSearch(700).subscribe(value => {
      if (value?.type === 'location') {
        this._fetchLocation(value.search);
      } else if (value?.type === 'service') {
        this._fetchCategories(value.search);
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this._interval);
  }

  private _fetchCategories(search: string) {
    this.isServiceSearchLoading = true;
    this._categoryService.searchCategories(search).subscribe({
      next: (res) => {
        this.serviceCategories = res.success && res.data ? res.data : [];
        this.isServiceSearchLoading = false;
      },
      error: () => {
        this.serviceCategories = [];
        this.isServiceSearchLoading = false;
      }
    });
  }

  private _getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by this browser.');
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );
    });
  }

  private _fetchLocation(value: string) {
    this.isLocationSearchLoading = true;
    this._locationService.getCoordinatesFromText(value).subscribe({
      next: (result) => {
        this.locationData$.next(result);
        this.isLocationSearchLoading = false;
      },
      error: () => {
        this.locationData$.next([]);
        this.isLocationSearchLoading = false;
      }
    });
  }

  filterTitle(value: string) {
    if (!value.trim()) return;
    this.isServiceSearchDropdownOpen = true;
    if (value !== this.selectedService?.categoryName) {
      this.selectedService = undefined;
    }
    this._debounceService.delay({ search: value, type: 'service' });
  }

  findLocation(value: string) {
    if (!value.trim()) return;
    this.isLocationSearchDropdownOpen = true;
    this.isLocationSearchLoading = true;
    if (value !== this.selectedLocation?.address) {
      this.selectedLocation = undefined;
    }
    this._debounceService.delay({ search: value, type: 'location' });
  }

  async detectCurrentLocation() {
    this.loadingCurrentLocation = true;
    try {
      const position = await this._getCurrentLocation();
      const { latitude, longitude } = position.coords;

      this._locationService.reverseGeocode(latitude, longitude).subscribe(location => {
        if (location) {
          const currentLocation: ISearchedLocation = { address: location.address, coordinates: location.coordinates };
          this.locationSearch = currentLocation.address;
          this.selectedLocation = currentLocation;
        }
      });

    } catch (err) {
      console.error('Error detecting location:', err);
    } finally {
      this.loadingCurrentLocation = false;
    }
  }

  findProviders() {
    if (!this.selectedService || !this.selectedLocation?.address || !this.selectedLocation.coordinates) {
      this._toastr.error('Please select a valid location and service.');
      return;
    }

    const { coordinates } = this.selectedLocation;

    const data = {
      categoryId: this.selectedService.categoryId,
      title: this.selectedService.categoryName,
      ...coordinates
    };

    const encodedData = base64Encode(JSON.stringify(data));

    this._router.navigate(['view_providers'], {
      queryParams: {
        ls: encodedData
      }
    });
  }

  startCarousel() {
    this._interval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.images.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    // Reset timer when user manually changes slide
    clearInterval(this._interval);
    this.startCarousel();
  }


}
