import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';

@Component({
  selector: 'app-provider-homepage',
  templateUrl: './provider-homepage.component.html',
  imports: [CommonModule],
})
export class ProviderHomepageComponent implements OnInit {
  private readonly _sharedService = inject(SharedDataService);

  ngOnInit(): void {
    this._sharedService.setProviderHeader('Dashboard');
  }
}
