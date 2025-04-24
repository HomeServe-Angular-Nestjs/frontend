import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { CustomerPickServiceCategoryListComponent } from "../../../shared/components/customer/pick-service/categories/customer-pick-service-category-list.component";
import { CustomerPickServiceListComponent } from "../../../shared/components/customer/pick-service/service-list/customer-pick-service-list.component";
import { CustomerServiceSelectedListComponent } from "../../../shared/components/customer/pick-service/selected-service-list/customer-pick-service-selected-list.component";
import { ReassuranceComponent } from "../../../shared/partials/sections/customer/reassurance/reassurance.component";
import { ActivatedRoute } from '@angular/router';
import { IOfferedService, ISubService } from '../../../../core/models/offeredService.model';
import { OfferedServicesService } from '../../../../core/services/service-management.service';
import { NotificationService } from '../../../../core/services/public/notification.service';
import { forkJoin } from 'rxjs';

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
  private serviceOfferedServices = inject(OfferedServicesService);
  private notyf = inject(NotificationService);

  serviceIds: string[] = [];
  serviceData: IOfferedService[] = [];
  serviceCategories: { title: string, image: string }[] = [];
  selectedServices: ISubService[] = [];
  purchasedServiceList: ISubService[] = [];

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
    this.selectedServices = selectedService?.subService ? selectedService.subService : [];
  }

  addSelectedService(serviceId: string) {
    const selectedService = this.selectedServices.find(service => service.id === serviceId);
    if (selectedService) {
      this.purchasedServiceList.push(selectedService);
    }
  }

  removeFromList(serviceId: string): void {
    this.purchasedServiceList = this.purchasedServiceList.filter(service => service.id !== serviceId);
  }
}
