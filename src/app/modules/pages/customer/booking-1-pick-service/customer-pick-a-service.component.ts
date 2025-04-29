import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { CustomerPickServiceCategoryListComponent } from "../../../shared/components/customer/pick-service/categories/customer-pick-service-category-list.component";
import { CustomerPickServiceListComponent, SelectedServiceIdType } from "../../../shared/components/customer/pick-service/service-list/customer-pick-service-list.component";
import { CustomerServiceSelectedListComponent } from "../../../shared/components/customer/pick-service/selected-service-list/customer-pick-service-selected-list.component";
import { ReassuranceComponent } from "../../../shared/partials/sections/customer/reassurance/reassurance.component";
import { ActivatedRoute, Router } from '@angular/router';
import { IOfferedService, ISubService } from '../../../../core/models/offeredService.model';
import { OfferedServicesService } from '../../../../core/services/service-management.service';
import { NotificationService } from '../../../../core/services/public/notification.service';
import { forkJoin } from 'rxjs';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';

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
  private readonly serviceOfferedServices = inject(OfferedServicesService);
  private readonly notyf = inject(NotificationService);
  private readonly sharedDataService = inject(SharedDataService);
  private router = inject(Router);

  serviceIds: string[] = [];
  serviceData: IOfferedService[] = [];
  serviceCategories: { title: string, image: string }[] = [];
  servicesOfSelectedCategory!: SelectedServiceType;
  purchasedServiceList: SelectedServiceType[] = [];

  constructor(private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(params => {
      const idsParam = params.get('ids');
      this.serviceIds = idsParam ? idsParam.split(',') : [];
    });
    if (this.serviceIds.length > 0) {
      this.fetchService(this.serviceIds);
    }
  }

  fetchService(serviceIds: string[]): void {
    const observables = serviceIds.map(id =>
      this.serviceOfferedServices.fetchOneService(id)
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
      error: (err) => this.notyf.error(err)
    })
  }

  getServiceOfSelectedCategory(categoryTitle: string) {
    const selectedService = this.serviceData.find(service => service.title === categoryTitle);
    if (selectedService) {
      this.servicesOfSelectedCategory = {
        id: selectedService.id,
        subService: selectedService.subService
      }
    }
  }

  addSelectedService(data: SelectedServiceIdType) {
    const { id } = this.servicesOfSelectedCategory;

    if (id && id === data.id) {
      if (!this.purchasedServiceList.length) {
        const sub = this.servicesOfSelectedCategory.subService.find(s => s.id === data.selectedId);
        this.purchasedServiceList.push({
          id: data.id,
          subService: sub ? [sub] : []
        });
      } else {
        this.purchasedServiceList.map(item => {
          if (item.id === id) {
            const selectedSub = this.servicesOfSelectedCategory.subService.find(s => s.id === data.selectedId);
            if (!selectedSub) return;

            const existingCategory = this.purchasedServiceList.find(item => item.id === data.id);

            if (existingCategory) {
              const alreadyExists = existingCategory.subService.find(s => s.id === data.selectedId);

              if (!alreadyExists) {
                existingCategory.subService.push(selectedSub);
              }
            } else {
              this.purchasedServiceList.push({
                id,
                subService: [selectedSub]
              });
            }
          }
        });
      }
    }
  }

  removeFromList(data: SelectedServiceIdType): void {
    this.purchasedServiceList.forEach(item => {
      if (item.id === data.id) {
        item.subService = item.subService.filter(s => s.id !== data.selectedId)
      }
    });
  }

  scheduleTime(event: boolean) {
    if (event) {
      this.sharedDataService.setSelectedServiceData(this.purchasedServiceList);
      this.router.navigate(['schedule_service']);
    }
  }
}
