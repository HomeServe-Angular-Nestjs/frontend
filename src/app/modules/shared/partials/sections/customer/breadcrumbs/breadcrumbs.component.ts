import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../../../../../core/services/public/breadcrumb.service';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav *ngIf="breadcrumbs().length > 0" class="hidden md:flex w-full min-w-0 px-3 sm:px-4 py-2 text-black bg-white rounded-lg border border-gray-100" aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-x-1 min-w-0">
        <li class="flex min-w-0 items-center">
          <a routerLink="/" class="inline-flex max-w-full items-center text-xs sm:text-sm font-medium text-black hover:underline cursor-pointer whitespace-normal break-words">
            Home
          </a>
        </li>
        <li *ngFor="let breadcrumb of breadcrumbs(); let last = last" class="min-w-0">
          <div class="flex min-w-0 items-center">
            <span class="shrink-0 text-gray-400 mx-1 sm:mx-2 text-xs sm:text-sm">/</span>
            <ng-container *ngIf="!last">
              <a [routerLink]="breadcrumb.url" class="max-w-full text-xs sm:text-sm font-medium text-black hover:underline cursor-pointer whitespace-normal break-words">{{ breadcrumb.label }}</a>
            </ng-container>
            <span *ngIf="last" class="max-w-full text-xs sm:text-sm font-semibold text-black whitespace-normal break-words">{{ breadcrumb.label }}</span>
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
