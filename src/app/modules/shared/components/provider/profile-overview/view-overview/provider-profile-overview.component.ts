import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IProvider } from '../../../../../../core/models/user.model';
import { selectProvider } from '../../../../../../store/provider/provider.selector';

@Component({
  selector: 'app-provider-profile-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './provider-profile-overview.component.html',
})
export class ProviderProfileOverviewComponent {
  private router = inject(Router);

  provider$!: Observable<IProvider | null>;

  constructor(private store: Store) {
    this.provider$ = this.store.select(selectProvider);
  }

  edit() {
    this.router.navigate(['provider', 'profiles', 'overview', 'edit']);
  }
}
