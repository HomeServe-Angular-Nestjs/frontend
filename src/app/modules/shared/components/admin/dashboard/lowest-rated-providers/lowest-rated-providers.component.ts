import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../../../core/services/admin.service';
import { ILowestRatedProvider } from '../../../../../../core/models/reviews.model';
import { ToastrService } from 'ngx-toastr';
import { Subject, filter, map, takeUntil } from 'rxjs';

@Component({
    selector: 'app-admin-lowest-rated-providers',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './lowest-rated-providers.component.html',
})
export class LowestRatedProvidersComponent implements OnInit, OnDestroy {
    private readonly _adminService = inject(AdminService);
    private readonly _toastr = inject(ToastrService);
    private readonly _destroy$ = new Subject<void>();

    providers: ILowestRatedProvider[] = [];
    isLoading = true;

    ngOnInit(): void {
        this._adminService.getLowestRatedProviders(5).pipe(
            map(res => res.data),
            filter(Boolean),
            takeUntil(this._destroy$)
        ).subscribe({
            next: (data) => {
                this.providers = data;
                this.isLoading = false;
            },
            error: () => {
                this._toastr.error('Failed to fetch lowest rated providers');
                this.isLoading = false;
            }
        });
    }

    getStarArray(rating: number): number[] {
        return Array(Math.floor(rating)).fill(0);
    }

    getEmptyStarArray(rating: number): number[] {
        return Array(5 - Math.floor(rating)).fill(0);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
