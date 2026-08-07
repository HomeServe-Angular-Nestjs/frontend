import { ChangeDetectionStrategy, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { encode as base64Encode } from 'js-base64';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { LocationService } from '../../../../../../core/services/public/location.service';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { LandingService } from '../../../../../../core/services/landing.service';
import { selectCheckStatus } from '../../../../../../store/auth/auth.selector';
import { ICustomerSearchCategories } from '../../../../../../core/models/category.model';
import { ISearchedLocation } from '../../../../../../core/models/user.model';
import { ILandingCategory } from '../../../../../../core/models/landing.model';

@Component({
    selector: 'app-landing-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [LocationService, DebounceService],
    templateUrl: './landing-search.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingSearchComponent implements OnInit, OnDestroy {
    private readonly _router = inject(Router);
    private readonly _store = inject(Store);
    private readonly _locationService = inject(LocationService);
    private readonly _debounceService = inject(DebounceService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _landingService = inject(LandingService);

    @Input() categories: ILandingCategory[] = [];

    readonly status = toSignal(this._store.select(selectCheckStatus), { initialValue: 'pending' });

    serviceCategories: ICustomerSearchCategories[] = [];
    serviceSearch = '';
    isServiceDropdownOpen = false;
    isServiceLoading = false;
    selectedCategoryId = '';
    selectedCategoryName = '';

    locationData$ = new BehaviorSubject<ISearchedLocation[]>([]);
    locationSearch = '';
    isLocationDropdownOpen = false;
    isLocationLoading = false;
    loadingCurrentLocation = false;
    selectedLocation?: ISearchedLocation;

    get isAuthenticated(): boolean {
        return this.status() === 'authenticated';
    }

    get popularCategories(): ILandingCategory[] {
        return this.categories.slice(0, 4);
    }

    onCategoryChange(value: string): void {
        const match = this.categories.find(cat => cat.categoryId === value);
        this.selectedCategoryName = match ? match.name : '';
    }

    ngOnInit(): void {
        this._debounceService.onSearch(700).subscribe(value => {
            if (value?.type === 'location') this._fetchLocation(value.search);
            else if (value?.type === 'service') this._fetchCategories(value.search);
        });
    }

    ngOnDestroy(): void {
        // BehaviorSubject / debounce cleanup handled on destroy
    }

    filterTitle(value: string): void {
        this.selectedCategoryName = '';
        this.selectedCategoryId = '';
        if (!value.trim()) return;
        this.isServiceDropdownOpen = true;
        this._debounceService.delay({ search: value, type: 'service' });
    }

    findLocation(value: string): void {
        if (!value.trim()) return;
        this.isLocationDropdownOpen = true;
        this.selectedLocation = undefined;
        this._debounceService.delay({ search: value, type: 'location' });
    }

    selectCategory(item: ICustomerSearchCategories): void {
        this.serviceSearch = item.categoryName;
        this.selectedCategoryName = item.categoryName;
        this.selectedCategoryId = item.categoryId;
        this.isServiceDropdownOpen = false;
        this.serviceCategories = [];
    }

    selectLandingCategory(cat: ILandingCategory): void {
        this.serviceSearch = cat.name;
        this.selectedCategoryName = cat.name;
        this.selectedCategoryId = cat.categoryId;
    }

    async detectCurrentLocation(): Promise<void> {
        this.loadingCurrentLocation = true;
        try {
            const position = await this._getCurrentPosition();
            const { latitude, longitude } = position.coords;
            this._locationService.reverseGeocode(latitude, longitude).subscribe(location => {
                if (location) {
                    this.selectedLocation = { address: location.address, coordinates: location.coordinates };
                    this.locationSearch = location.address;
                }
            });
        } catch {
            this._toastr.warning('Could not detect your location.');
        } finally {
            this.loadingCurrentLocation = false;
        }
    }

    search(): void {
        const hasCategory = !!(this.selectedCategoryId || this.selectedCategoryName);
        const hasLocation = !!(this.selectedLocation?.address && this.selectedLocation.coordinates);

        if (!hasCategory && this.serviceSearch.trim()) {
            this.selectedCategoryName = this.serviceSearch.trim();
        }

        if (!(this.selectedCategoryId || this.selectedCategoryName)) {
            this._toastr.error('Please select a service or category.');
            return;
        }
        if (!hasLocation) {
            this._toastr.error('Please select a valid location.');
            return;
        }

        const serviceName = this.selectedCategoryName || this.serviceSearch.trim();
        const data = {
            categoryId: this.selectedCategoryId || '',
            title: serviceName,
            ...this.selectedLocation!.coordinates,
        };
        const encodedData = base64Encode(JSON.stringify(data));
        const searchPath = `/view_providers?ls=${encodedData}&address=${encodeURIComponent(this.selectedLocation!.address)}`;

        if (!this.isAuthenticated) {
            this._router.navigate(['/login'], {
                queryParams: { role: 'customer', return: searchPath },
            });
            return;
        }

        this._router.navigateByUrl(searchPath);
    }

    private _getCurrentPosition(): Promise<GeolocationPosition> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) reject('Geolocation not supported');
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    private _fetchCategories(search: string): void {
        this.isServiceLoading = true;
        this._landingService.searchCategories(search).subscribe({
            next: res => {
                this.serviceCategories = res.success && res.data ? res.data : [];
                this.isServiceLoading = false;
            },
            error: () => {
                this.serviceCategories = [];
                this.isServiceLoading = false;
            },
        });
    }

    private _fetchLocation(value: string): void {
        this.isLocationLoading = true;
        this._locationService.getCoordinatesFromText(value).subscribe({
            next: result => {
                this.locationData$.next(result);
                this.isLocationLoading = false;
            },
            error: () => {
                this.locationData$.next([]);
                this.isLocationLoading = false;
            },
        });
    }
}