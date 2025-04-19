import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-provider-profile-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './provider-profile-overview.component.html',
})
export class ProviderProfileOverviewComponent {
  private router = inject(Router);

  edit() {
    this.router.navigate(['provider', 'profiles', 'overview', 'edit']);
  }
}
