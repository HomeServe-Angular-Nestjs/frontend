import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, forkJoin, Subject, takeUntil } from 'rxjs';
import { IProviderService } from '../../../../core/models/provider-service.model';
import { ServiceManagementService } from '../../../../core/services/service-management.service';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';
import { SelectedServiceIdType } from "../../../shared/components/customer/pick-service/service-list/customer-pick-service-list.component";
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';

export type SelectedServiceType = {
  id: string,
  name: string,
  services: IProviderService[]
};

export type SelectedServiceIdsType = {
  id: string,
  selectedIds: string[]
};

@Component({
  selector: 'app-customer-pick-a-service',
  templateUrl: './customer-pick-a-service.component.html',
  imports: [
    CommonModule,
  ],
})
export class CustomerPickAServiceComponent implements OnInit, OnDestroy {
  private readonly _serviceManagementService = inject(ServiceManagementService);
  private readonly _sharedDataService = inject(SharedDataService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  private destroy$ = new Subject<void>();

  cartItemCount = signal(0);
  totalPrice = signal(0);
  scrollPos = false;

  providerId!: string | null;
  selectedServiceId: string = '';
  serviceIds: string[] = [];   // Array of service IDs from query parameters
  allProviderServices: IProviderService[] = [];
  serviceCategories: { title: string, image: string, id: string }[] = [];
  servicesOfSelectedCategory!: SelectedServiceType;   // Currently selected category and its corresponding services
  purchasedServiceList: SelectedServiceType[] = [];   // List of selected services grouped by category

  ngOnInit() {
    const pathParams$ = this._route.paramMap;
    const queryParams$ = this._route.queryParamMap;

    combineLatest([pathParams$, queryParams$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([pathParam, queryParam]) => {
        this.providerId = pathParam.get('id');
        this.serviceIds = queryParam?.get('ids')?.split(',') || [];
        this.selectedServiceId = queryParam?.get('selectedServiceId') || '';

        if (this.providerId) {
          this.loadAllProviderServices(this.providerId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scrollToCart(pos: boolean) {
    this.scrollPos = pos;
    pos
      ? document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' })
      : window.scrollTo(0, 0)
  }

  /**
   * Loads all services offered by the provider and handles pre-selection.
   */
  loadAllProviderServices(providerId: string): void {
    this._serviceManagementService.getServicesByProviderId(providerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.allProviderServices = res.data;

            // Generate categories from available services
            const categoryMap = new Map<string, { name: string, image: string, id: string }>();
            this.allProviderServices.forEach(service => {
              if (!categoryMap.has(service.category.id)) {
                categoryMap.set(service.category.id, {
                  id: service.category.id,
                  name: service.category.name,
                  image: service.image // Using first service image as category image
                });
              }
            });

            this.serviceCategories = Array.from(categoryMap.values()).map(c => ({
              id: c.id,
              title: c.name,
              image: c.image
            }));

            // Handle pre-selection from query params
            this.serviceIds.forEach(id => {
              const service = this.allProviderServices.find(s => s.id === id);
              if (service) {
                this._addServiceToPurchasedList(service);
              }
            });

            // Set default selected category if none selected
            if (this.serviceCategories.length > 0) {
              const initialCategory = this.selectedServiceId
                ? this.allProviderServices.find(s => s.id === this.selectedServiceId)?.category.name
                : this.serviceCategories[0].title;

              if (initialCategory) {
                this.getServiceOfSelectedCategory(initialCategory);
              }
            }
          }
        },
        error: (err) => this._toastr.error(err.message || 'Failed to load services')
      });
  }

  private _addServiceToPurchasedList(service: IProviderService) {
    const existingCategory = this.purchasedServiceList.find(c => c.id === service.category.id);

    if (existingCategory) {
      const alreadyExists = existingCategory.services.some(s => s.id === service.id);
      if (!alreadyExists) {
        existingCategory.services.push(service);
        this.cartItemCount.update(n => n + 1);
        this.totalPrice.update(p => p + +service.price);
      }
    } else {
      this.purchasedServiceList.push({
        id: service.category.id,
        name: service.category.name,
        services: [service]
      });
      this.cartItemCount.update(n => n + 1);
      this.totalPrice.update(p => p + +service.price);
    }
  }

  /**
   * Sets the currently selected category and loads its sub-services.
   * Used when a category is clicked in the UI.
   */
  getServiceOfSelectedCategory(categoryTitle: string) {
    const services = this.allProviderServices.filter(s => s.category.name === categoryTitle);
    if (services.length > 0) {
      this.servicesOfSelectedCategory = {
        id: services[0].category.id,
        name: categoryTitle,
        services: services
      }
    }
  }

  /**
   * Adds a selected sub-service to the purchased list.
   * Ensures no duplicate category or sub-service is added.
   * @param data - Contains category ID and selected sub-service ID
   */
  addSelectedService(data: SelectedServiceIdType) {
    const service = this.allProviderServices.find(s => s.id === data.selectedId);
    if (service) {
      this._addServiceToPurchasedList(service);
    }
  }

  /**
 * Removes a specific sub-service from the purchased list.
 * @param data - Contains category ID and sub-service ID to be removed
 */
  removeFromList(data: SelectedServiceIdType): void {
    const category = this.purchasedServiceList.find(c => c.id === data.id);
    if (category) {
      const initialLength = category.services.length;
      category.services = category.services.filter(s => s.id !== data.selectedId);
      if (category.services.length < initialLength) {
        this.cartItemCount.update(n => n - 1);
        const service = this.allProviderServices.find(s => s.id === data.selectedId);
        if (service) {
          this.totalPrice.update(p => p - +service.price);
        }
      }
      // Remove category if empty
      if (category.services.length === 0) {
        this.purchasedServiceList = this.purchasedServiceList.filter(c => c.id !== data.id);
      }
    }
  }

  /**
  * Finalizes the selection and navigates to the scheduling page if valid.
  * Saves the selected service data via shared service.
  */
  scheduleTime() {
    if (this.purchasedServiceList.length <= 0) return;
    this._sharedDataService.setSelectedServiceData(this.purchasedServiceList);
    this._router.navigate(['schedule_service', this.providerId]);
  }

  goBack() {
    this._router.navigate(['provider_details', this.providerId, 'services']);
  }
}
