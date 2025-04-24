import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { forkJoin, Subscription } from 'rxjs';
import { IProvider } from '../../../../../../core/models/user.model';
import { IOfferedService } from '../../../../../../core/models/offeredService.model';
import { OfferedServicesService } from '../../../../../../core/services/service-management.service';
import { NotificationService } from '../../../../../../core/services/public/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-provider-profile-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-provider-profile-services.component.html',
})
export class CustomerProviderProfileServicesComponent {
  private providerService = inject(ProviderService);
  private serviceOfferedService = inject(OfferedServicesService);
  private notyf = inject(NotificationService);
  private router = inject(Router);

  private providerDataSub!: Subscription;

  providerData!: IProvider | null;
  serviceData: IOfferedService[] = [];
  serviceCategories: string[] = [];

  ngOnInit(): void {
    this.providerDataSub = this.providerService.providerData$.subscribe(data => {
      this.providerData = data;
    });

    if (this.providerData && this.providerData.servicesOffered.length > 0) {
      this.loadAllServices(this.providerData.servicesOffered);
    }
  }

  loadAllServices(serviceIds: string[]) {
    const observables = serviceIds.map(id =>
      this.serviceOfferedService.fetchOneService(id)
    );

    forkJoin(observables).subscribe({
      next: (service) => {
        this.serviceData = service;
        service.forEach(s => this.serviceCategories.push(s.title));
      },
      error: (err) => this.notyf.error(err)
    });
  }

  bookService(ids: string[]) {
    if (ids.length < 0) return;
    this.router.navigate(['pick_a_service'], {
      queryParams: { ids: ids.join(',') }
    });
  }

  ngOnDestroy(): void {
    if (this.providerDataSub) {
      this.providerDataSub.unsubscribe();
    }
  }
}
