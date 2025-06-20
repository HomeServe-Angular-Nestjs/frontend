import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter, map, Observable, switchMap, tap } from 'rxjs';
import { IProvider } from '../../../../../../core/models/user.model';
import { ActivatedRoute } from '@angular/router';
import { ProviderService } from '../../../../../../core/services/provider.service';

@Component({
  selector: 'app-customer-provider-profile-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-provider-profile-about.component.html',
})
export class CustomerProviderProfileAboutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly providerService = inject(ProviderService);

  provider$!: Observable<IProvider | null>;

  ngOnInit(): void {
    this.provider$ = this.route.parent!.paramMap.pipe(
      map(param => param.get('id')),
      switchMap(providerId => this.providerService.getOneProvider(providerId))
    );
  }
}
