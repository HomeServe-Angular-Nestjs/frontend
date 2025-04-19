import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileBreadcrumbsComponent } from "../../../shared/partials/sections/provider/breadcrumbs/profile/profile-breadcrumbs.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-profiles-layout',
  standalone: true,
  imports: [CommonModule, ProfileBreadcrumbsComponent, RouterOutlet],
  templateUrl: './profiles-layout.component.html',
})
export class ProfilesLayoutComponent { }
