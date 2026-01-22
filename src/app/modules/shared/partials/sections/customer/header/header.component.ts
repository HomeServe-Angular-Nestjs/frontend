import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, finalize } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { authActions } from '../../../../../../store/auth/auth.actions';
import { selectCheckStatus } from '../../../../../../store/auth/auth.selector';
import { selectCustomer } from '../../../../../../store/customer/customer.selector';
import { getColorFromChar } from '../../../../../../core/utils/style.utils';
import { customerActions } from '../../../../../../store/customer/customer.actions';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { CustomerService } from '../../../../../../core/services/customer.service';
import { selectTotalUnReadNotificationCount } from '../../../../../../store/notification/notification.selector';
import { CartService } from '../../../../../../core/services/cart.service';
import { ICustomerSearchCategories } from '../../../../../../core/models/category.model';
import { CategoryService } from '../../../../../../core/services/category.service';
import { IOpenCageLocation, LocationService } from '../../../../../../core/services/public/location.service';

@Component({
  selector: 'app-customer-header',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  providers: [DebounceService, LocationService]
})
export class CustomerHeaderComponent implements OnInit {
  private readonly _debounceService = inject(DebounceService);
  private readonly _customerService = inject(CustomerService);
  private readonly _categoryService = inject(CategoryService);
  private readonly _locationService = inject(LocationService);
  public readonly _cartService = inject(CartService);
  private readonly _router = inject(Router);
  private readonly _store = inject(Store);

  private readonly _destroy$ = new Subject<void>();

  @Input() isFixed: boolean = true;
  showMobileSearch = false;
  defaultImg = 'assets/images/profile_placeholder.jpg';
  isHomepage = false;

  // User Signals
  public readonly userStatus = toSignal(this._store.select(selectCheckStatus));
  private readonly _customer = toSignal(this._store.select(selectCustomer));

  public readonly avatar = computed(() => this._customer()?.avatar ?? null);
  public readonly email = computed(() => this._customer()?.email ?? '');
  public readonly username = computed(() => this._customer()?.username ?? '');
  public readonly fullname = computed(() => this._customer()?.fullname ?? '');
  public readonly fallbackChar = computed(() => this._customer()?.username?.charAt(0).toUpperCase() ?? '');
  public readonly fallbackColor = computed(() => {
    const char = this.fallbackChar();
    return char ? getColorFromChar(char) : '#4f46e5';
  });

  public readonly unReadNotificationCount = toSignal(
    this._store.select(selectTotalUnReadNotificationCount),
    { initialValue: 0 }
  );

  // Service Search
  categorySearch = '';
  fetchedCategories: ICustomerSearchCategories[] = [];
  isLoadingCategories = false;

  // location
  locationSearch = '';
  locationData = signal<IOpenCageLocation[]>([]);
  isLocationSearchLoading = false;

  ngOnInit(): void {
    this._store.dispatch(customerActions.fetchOneCustomer());

    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe((searchObj: { search: string, type: string }) => {
        if (searchObj.type === 'location') {
          this.fetchLocations(searchObj.search);
        } else if (searchObj.type === 'category') {
          this.fetchCategories(searchObj.search);
        } else {
          this.isLoadingCategories = false;
          this.isLocationSearchLoading = false;
        }
      });

    this._cartService.getCart().subscribe();

    this.checkHomepage();

    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this._destroy$)
    ).subscribe(() => {
      this.checkHomepage();
    });
  }

  private checkHomepage() {
    const url = this._router.url;
    this.isHomepage = url === '/homepage' || url.split('?')[0] === '/';
  }

  get cartCount(): number {
    return this._cartService.cartItemCount();
  }

  searchLocations(): void {
    if (!this.locationSearch.trim()) return;
    this.isLocationSearchLoading = true;
    this._debounceService.delay({ search: this.locationSearch, type: 'location' });
  }

  searchCategories(): void {
    if (!this.categorySearch.trim()) return;
    this.isLoadingCategories = true;
    this._debounceService.delay({ search: this.categorySearch, type: 'category' });
  }

  handleLocationClick(locationSearch: IOpenCageLocation): void {
    this.locationSearch = '';
    this.locationData.set([]);
    this.isLocationSearchLoading = false;

    const current = this._router.routerState.snapshot.root.queryParams;

    this._router.navigate(['/view_providers'], {
      queryParams: {
        lat: locationSearch.coordinates.lat,
        lng: locationSearch.coordinates.lng,
        categoryId: current['categoryId'] || ''
      },
    });
  }

  handleCategoryClick(categoryId: string): void {
    this.categorySearch = '';
    this.fetchedCategories = [];
    this.isLoadingCategories = false;

    const current = this._router.routerState.snapshot.root.queryParams;

    this._router.navigate(['/view_providers'], {
      queryParams: {
        categoryId,
        lat: current['lng'] || '',
        lng: current['lat'] || '',
      },
    });
  }

  logout(): void {
    this._store.dispatch(authActions.logout({ fromInterceptor: false }));
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If not on homepage, navigate to homepage first then scroll
      this._router.navigate(['/']).then(() => {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      });
    }
  }

  private fetchLocations(search: string): void {
    this._locationService.getCoordinatesFromText(search)
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => this.isLocationSearchLoading = false)
      )
      .subscribe({
        next: (result) => {
          this.locationData.set(result);
        },
        error: () => {
          this.locationData.set([]);
        }
      });
  }

  private fetchCategories(search: string): void {
    this._categoryService.searchCategories(search)
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => this.isLoadingCategories = false)
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.fetchedCategories = res.data;
          }
        },
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
