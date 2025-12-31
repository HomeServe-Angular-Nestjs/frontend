import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../../../../../core/services/public/breadcrumb.service';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav *ngIf="breadcrumbs().length > 0" class="flex px-4 py-2 text-black bg-white rounded-lg border border-gray-100" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1">
        <li class="inline-flex items-center">
          <a routerLink="/" class="inline-flex items-center text-sm font-medium text-black hover:underline cursor-pointer">
            Home
          </a>
        </li>
        <li *ngFor="let breadcrumb of breadcrumbs(); let last = last">
          <div class="flex items-center">
            <span class="text-gray-400 mx-2 text-sm">/</span>
            <ng-container *ngIf="!last">
              <a [routerLink]="breadcrumb.url" class="text-sm font-medium text-black hover:underline cursor-pointer">{{ breadcrumb.label }}</a>
            </ng-container>
            <span *ngIf="last" class="text-sm font-semibold text-black">{{ breadcrumb.label }}</span>
          </div>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 0.5rem;
    }
  `]
})
export class BreadcrumbsComponent {
  private breadcrumbService = inject(BreadcrumbService);
  breadcrumbs = this.breadcrumbService.breadcrumbs;
}
