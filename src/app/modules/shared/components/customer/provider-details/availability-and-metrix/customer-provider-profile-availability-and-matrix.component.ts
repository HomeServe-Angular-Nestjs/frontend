import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { Subscription } from 'rxjs';
import { IProvider } from '../../../../../../core/models/user.model';
import { MapboxMapComponent } from "../../../../partials/shared/map/map.component";
import { API_KEY } from '../../../../../../../environments/env';

@Component({
  selector: 'app-customer-provider-profile-availability-and-matrix',
  standalone: true,
  imports: [CommonModule, MapboxMapComponent],
  templateUrl: './customer-provider-profile-availability-and-matrix.component.html',
})
export class CustomerProviderProfileAvailabilityAndMatrixComponent {
  private providerService = inject(ProviderService);

  private providerDataSub!: Subscription;

  readonly mapboxToken = API_KEY.mapbox;

  providerData!: IProvider | null;
  zoom = 12;
  center: [number, number] | undefined = undefined;
  address: string | undefined = '';

  ngOnInit(): void {
    this.providerDataSub = this.providerService.providerData$.subscribe(data => {
      if (data) {
        this.providerData = data;
        this.center = data?.location?.coordinates;
        this.address = data?.address;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.providerDataSub) {
      this.providerDataSub.unsubscribe();
    }
  }
}
