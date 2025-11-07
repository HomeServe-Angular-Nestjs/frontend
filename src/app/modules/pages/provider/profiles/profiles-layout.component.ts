import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileBreadcrumbsComponent } from "../../../shared/partials/sections/provider/breadcrumbs/profile/profile-breadcrumbs.component";
import { RouterOutlet } from '@angular/router';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';

@Component({
  selector: 'app-profiles-layout',
  standalone: true,
  imports: [CommonModule, ProfileBreadcrumbsComponent, RouterOutlet],
  templateUrl: './profiles-layout.component.html',
})
export class ProfilesLayoutComponent implements OnInit {
  private readonly _sharedDataService = inject(SharedDataService);

  ngOnInit(): void {
    this._sharedDataService.setProviderHeader('Profile Overview')
  }
}
