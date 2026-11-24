import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CustomerService } from "../../../../../../core/services/customer.service";
import { ActivatedRoute } from "@angular/router";
import { delay, Subject, takeUntil } from "rxjs";

@Component({
    selector: 'app-customer-provider-profile-gallery',
    templateUrl: 'profile-gallery.component.html',
    imports: [CommonModule]
})
export class CustomerProviderGalleryComponent implements OnInit, OnDestroy {
    private readonly _customerService = inject(CustomerService);
    private readonly _route = inject(ActivatedRoute);
    private readonly _destroy$ = new Subject<void>();

    workImages: string[] = [];
    isLoading = false;
    loadError = false;

    ngOnInit(): void {
        this._route.parent?.params
            .pipe(takeUntil(this._destroy$))
            .subscribe(params => {
            const providerId = params['id'];
            if (providerId) {
                this.loadGallery(providerId);
            }
        });
    }

    retryLoad(): void {
        const providerId = this._route.parent?.snapshot.paramMap.get('id');
        if (providerId) this.loadGallery(providerId);
    }

    private loadGallery(providerId: string): void {
        this.isLoading = true;
        this.loadError = false;
        this.workImages = [];

        this._customerService.getProviderGalleryImages(providerId)
            .pipe(delay(600), takeUntil(this._destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this.workImages = res.data ?? [];
                    } else {
                        this.loadError = true;
                        console.error('[Gallery] failed to load provider images:', res.message);
                    }
                },
                error: (error) => {
                    this.loadError = true;
                    this.isLoading = false;
                    console.error('[Gallery] failed to load provider images:', error);
                },
                complete: () => this.isLoading = false,
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}