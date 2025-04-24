import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProvider } from '../../../../../../core/models/user.model';
import { Subscription } from 'rxjs';
import { ProviderService } from '../../../../../../core/services/provider.service';

@Component({
  selector: 'app-customer-provider-profile-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-provider-profile-overview.component.html',
})
export class CustomerProviderProfileOverviewComponent implements OnInit, OnDestroy {
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
