import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-provider-profile-overview-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './provider-profile-overview-layout.component.html',
})
export class ProviderProfileOverviewLayoutComponent {
}

