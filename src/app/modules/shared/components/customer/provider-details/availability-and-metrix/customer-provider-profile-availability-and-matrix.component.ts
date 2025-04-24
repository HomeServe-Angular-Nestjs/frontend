import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { Subscription } from 'rxjs';
import { IProvider } from '../../../../../../core/models/user.model';

@Component({
  selector: 'app-customer-provider-profile-availability-and-matrix',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-provider-profile-availability-and-matrix.component.html',
})
export class CustomerProviderProfileAvailabilityAndMatrixComponent {
  private providerService = inject(ProviderService);

  private providerDataSub!: Subscription;

  providerData!: IProvider | null;

  ngOnInit(): void {
    this.providerDataSub = this.providerService.providerData$.subscribe(data => {
      this.providerData = data;
    });
  }

  ngOnDestroy(): void {
    if (this.providerDataSub) {
      this.providerDataSub.unsubscribe();
    }
  }
}
