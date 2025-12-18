import { Component, inject, OnInit } from '@angular/core';
import { ProviderDefaultAvailabilityComponent } from "../../../shared/components/provider/availability/default-availability/default-availability.component";
import { ProviderAvailabilityDateOverridesComponent } from "../../../shared/components/provider/availability/date-overrides/date-overrides.component";
import { ProviderAvailabilityComponentSlotRulesComponent } from "../../../shared/components/provider/availability/slot-rules/slot-rules.component";
import { SharedDataService } from '../../../../core/services/public/shared-data.service';

@Component({
  selector: 'app-provider-availability',
  imports: [ProviderDefaultAvailabilityComponent, ProviderAvailabilityDateOverridesComponent, ProviderAvailabilityComponentSlotRulesComponent],
  templateUrl: './availability.component.html',
})
export class ProviderAvailabilityComponent implements OnInit {
  private readonly _sharedService = inject(SharedDataService);

  ngOnInit(): void {
    this._sharedService.setProviderHeader('Availability Management');
  }

}
