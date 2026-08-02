import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { IProvider } from '../../../../../../core/models/user.model';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { CustomerProviderProfileAvailabilityAndMatrixComponent } from '../availability-and-metrix/customer-provider-profile-availability-and-matrix.component';

@Component({
  selector: 'app-customer-provider-profile-about',
  standalone: true,
  imports: [CommonModule, CustomerProviderProfileAvailabilityAndMatrixComponent],
  templateUrl: './customer-provider-profile-about.component.html',
})
export class CustomerProviderProfileAboutComponent implements OnInit, OnDestroy {
  private readonly _providerService = inject(ProviderService);

  private _providerSub!: Subscription;

  provider: IProvider | null = null;

  ngOnInit(): void {
    this._providerSub = this._providerService.providerData$.subscribe(data => {
      if (data) {
        this.provider = data as IProvider;
      }
    });
  }

  ngOnDestroy(): void {
    if (this._providerSub) {
      this._providerSub.unsubscribe();
    }
  }
}
