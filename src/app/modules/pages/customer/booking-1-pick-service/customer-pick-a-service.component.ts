import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { IOfferedService, ISubService } from '../../../../core/models/offeredService.model';
import { OfferedServicesService } from '../../../../core/services/service-management.service';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';
import { CustomerPickServiceListComponent, SelectedServiceIdType } from "../../../shared/components/customer/pick-service/service-list/customer-pick-service-list.component";
import { CustomerPickServiceCategoryListComponent } from "../../../shared/components/customer/pick-service/categories/customer-pick-service-category-list.component";
import { CustomerServiceSelectedListComponent } from "../../../shared/components/customer/pick-service/selected-service-list/customer-pick-service-selected-list.component";
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { ReassuranceComponent } from "../../../shared/partials/sections/customer/reassurance/reassurance.component";
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';

export type SelectedServiceType = {
  id: string,
  subService: ISubService[]
};

export type SelectedServiceIdsType = {
  id: string,
  selectedIds: string[]
};


@Component({
  selector: 'app-customer-pick-a-service',
  standalone: true,
  imports: [
    CommonModule,
    CustomerBreadcrumbsComponent,
    CustomerPickServiceCategoryListComponent,
    CustomerPickServiceListComponent,
    CustomerServiceSelectedListComponent,
    ReassuranceComponent,
  ],
  templateUrl: './customer-pick-a-service.component.html',
})
export class CustomerPickAServiceComponent {
  private readonly _serviceOfferedServices = inject(OfferedServicesService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _sharedDataService = inject(SharedDataService);
  private _router = inject(Router);

  cartItemCount = signal(0);
  scrollPos = false;
  providerId!: string | null;
  serviceIds: string[] = [];   // Array of service IDs from query parameters
  serviceData: IOfferedService[] = [];
  serviceCategories: { title: string, image: string }[] = [];
  servicesOfSelectedCategory!: SelectedServiceType;   // Currently selected category and its corresponding sub-services
  purchasedServiceList: SelectedServiceType[] = [];   // List of selected services with their sub-services to be scheduled

  /**
  * On initialization, fetch route params and query params, then load services.
  */
  //!TODO - Not properly wrote (paramMap refactor)  
  constructor(private route: ActivatedRoute) {
    // Capture provider ID from route params
    this.route.paramMap.subscribe(param => {
      this.providerId = param.get('id');
    })

    // Capture service IDs from query parameters and initiate fetch
    this.route.queryParamMap.subscribe(params => {
      const idsParam = params.get('ids');
      this.serviceIds = idsParam ? idsParam.split(',') : [];
    });

    if (this.serviceIds.length > 0) {
      this.fetchService(this.serviceIds);
    }
  }

  scrollToCart(pos: boolean) {
    this.scrollPos = pos;
    pos
      ? document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' })
      : window.scrollTo(0, 0)
  }

  /**
  * Fetches the full data of the services based on given IDs.
  * Populates both serviceData (full objects) and serviceCategories (for display).
  */
  fetchService(serviceIds: string[]): void {
    const observables = serviceIds.map(id =>
      this._serviceOfferedServices.fetchOneService(id)
    );

    forkJoin(observables).subscribe({
      next: (services) => {
        this.serviceData = services
        services.forEach(service => {
          this.serviceCategories.push({
            title: service.title,
            image: service.image
          });
        })
      },
      error: (err) => this._toastr.error(err)
    })
  }

  /**
   * Sets the currently selected category and loads its sub-services.
   * Used when a category is clicked in the UI.
   */
  getServiceOfSelectedCategory(categoryTitle: string) {
    const selectedService = this.serviceData.find(service => service.title === categoryTitle);
    if (selectedService) {
      this.servicesOfSelectedCategory = {
        id: selectedService.id,
        subService: selectedService.subService
      }
    }
  }

  /**
   * Adds a selected sub-service to the purchased list.
   * Ensures no duplicate category or sub-service is added.
   * @param data - Contains category ID and selected sub-service ID
   */
  addSelectedService(data: SelectedServiceIdType) {
    const { id } = this.servicesOfSelectedCategory;
    if (!id || id !== data.id) {
      this._toastr.error('Invalid category selection.');
      return;
    }

    // Find the selected sub-service
    const selectedSub = this.servicesOfSelectedCategory.subService.find(
      s => s.id === data.selectedId
    );
    if (!selectedSub) return;

    // Check if the category already exists in the list
    const existingCategory = this.purchasedServiceList.find(
      item => item.id === id
    );

    if (existingCategory) {
      // Check if the sub-service is already added
      const alreadyExists = existingCategory.subService.some(
        s => s.id === data.selectedId
      );

      if (!alreadyExists) {
        existingCategory.subService.push(selectedSub);
        this.cartItemCount.update((n) => n += 1);
      }
    } else {
      // Add new category with the selected sub-service
      this.purchasedServiceList.push({
        id,
        subService: [selectedSub],
      });
      this.cartItemCount.update((n) => n += 1);
    }
  }

  /**
 * Removes a specific sub-service from the purchased list.
 * @param data - Contains category ID and sub-service ID to be removed
 */
  removeFromList(data: SelectedServiceIdType): void {
    this.purchasedServiceList.forEach(item => {
      if (item.id === data.id) {
        item.subService = item.subService.filter(s => s.id !== data.selectedId);
        this.cartItemCount.update((n) => n -= 1);
      }
    });
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
}
