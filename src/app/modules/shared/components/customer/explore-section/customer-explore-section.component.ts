import { Component, inject, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferedServicesService } from '../../../../../core/services/service-management.service';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { IGetServiceTitle } from '../../../../../core/models/offeredService.model';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../../../../core/services/public/location.service';
import { DebounceService } from '../../../../../core/services/public/debounce.service';
import { Router } from '@angular/router';
import { ToastNotificationService } from '../../../../../core/services/public/toastr.service';

interface ISearchedLocation {
  address: string;
  coordinates: [number, number];
}

@Component({
  selector: 'app-customer-explore-section',
  templateUrl: './customer-explore-section.component.html',
  imports: [CommonModule, FormsModule],
  providers: [LocationService, DebounceService],
})
export class CustomerExploreSectionComponent {
  private readonly _servicesOfferedService = inject(OfferedServicesService);
  private readonly _locationService = inject(LocationService);
  private readonly _debounceService = inject(DebounceService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _router = inject(Router);

  private _allServiceTitles$ = new BehaviorSubject<IGetServiceTitle[]>([]);
  private _search$ = new BehaviorSubject<string>('');
  private _interval: any;

  serviceTitles$!: Observable<IGetServiceTitle[]>;
  serviceSearch: string = '';
  isServiceSearchDropdownOpen = false;
  selectedService!: IGetServiceTitle;

  locationData$ = new BehaviorSubject<ISearchedLocation[]>([]);
  locationSearch: string = '';
  isLocationSearchDropdownOpen = false;
  isLocationSearchLoading = false;
  loadingCurrentLocation = false;
  selectedLocation!: ISearchedLocation;

  currentSlide = 0;

  services = [
    {
      icon: 'fa-broom',
      title: 'Cleaning Services',
      description: 'Professional home cleaning'
    },
    {
      icon: 'fa-wrench',
      title: 'Plumbing',
      description: 'Expert plumbing solutions'
    },
    {
      icon: 'fa-bolt',
      title: 'Electrical',
      description: 'Electrical maintenance'
    },
    {
      icon: 'fa-paint-roller',
      title: 'Painting',
      description: 'Interior & exterior painting'
    }
  ];


  images = [
    { src: 'service1.jpg', alt: 'Home Service 1' },
    { src: 'service2.jpg', alt: 'Home Service 2' },
    { src: 'service3.jpg', alt: 'Home Service 3' }
  ];

  ngOnInit() {
    this.startCarousel();
    this._fetchAllServiceTitles();

    this._debounceService.onSearch(700).subscribe(value => {
      this._fetchLocation(value);
    })
  }

  ngOnDestroy() {
    clearInterval(this._interval);
  }

  private _fetchAllServiceTitles() {
    this._servicesOfferedService.getHomepageServiceTitles().pipe(
      map(res => res.data ?? []
      )
    ).subscribe(data => this._allServiceTitles$.next(data));

    this.serviceTitles$ = combineLatest([this._allServiceTitles$, this._search$]).pipe(
      map(([services, search]) =>
        search !== 'all' ? services.filter(service =>
          service.title.toLowerCase().includes(search.toLowerCase())
        ) : services)
    );
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
      error: (err) => {
        console.error(err);
        this.locationData$.next([]);
        this.isLocationSearchLoading = false;
      }
    });
  }

  filterTitle(value: string) {
    if (!value.trim()) return;
    this.isServiceSearchDropdownOpen = true;
    this._search$.next(value);
  }

  findLocation(value: string) {
    if (!value.trim()) return;
    this.isLocationSearchDropdownOpen = true;
    this.isLocationSearchLoading = true;
    this._debounceService.delay(value);
  }

  async detectCurrentLocation() {
    this.loadingCurrentLocation = true;
    try {
      const position = await this._getCurrentLocation();
      const { latitude, longitude } = position.coords;

      this._locationService.openCageReverseGeoCode(latitude, longitude).subscribe(location => {
        const data = location.results[0];
        const currentLocation: ISearchedLocation = { address: data.formatted, coordinates: data.geometry };
        this.locationSearch = currentLocation.address;
        this.selectedLocation = currentLocation;
      });

    } catch (err) {
      console.error('Error detecting location:', err);
    } finally {
      this.loadingCurrentLocation = false;
    }
  }

  findProviders() {
    const hasLocation = this.selectedLocation?.address && this.selectedLocation?.coordinates;
    const hasService = this.selectedService?.id && this.selectedService?.title;

    if (!hasLocation || !hasService) {
      this._toastr.error('Please select a valid location and service.');
      return;
    }

    this._router.navigate(['view_providers'], {
      queryParams: {
        hs: {
          ...this.selectedService,
          ...this.selectedLocation
        }
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
