import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';

@Component({
  selector: 'app-provider-header',
  templateUrl: './provider-header.component.html',
  imports: [CommonModule, RouterLink],
})
export class ProviderHeaderComponent {
  private readonly _sharedService = inject(SharedDataService);

  providerHeader$ = this._sharedService.providerHeader$;
}
