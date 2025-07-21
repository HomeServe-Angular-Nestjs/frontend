import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { CustomerService } from "../../../../../../core/services/customer.service";
import { ActivatedRoute } from "@angular/router";
import { delay } from "rxjs";

@Component({
    selector: 'app-customer-provider-profile-gallery',
    templateUrl: 'profile-gallery.component.html',
    imports: [CommonModule]
})
export class CustomerProviderGalleryComponent implements OnInit {
    private readonly _customerService = inject(CustomerService);
    private readonly _route = inject(ActivatedRoute);

    workImages: string[] = [];
    isLoading = false;

    ngOnInit(): void {
        this.isLoading = true;
        this._route.parent?.params.subscribe(params => {
            const providerId = params['id'];
            if (providerId) {
                this._customerService.getProviderGalleryImages(providerId)
                    .pipe(delay(600)).subscribe({
                        next: (res) => {
                            if (res.success && res.data) {
                                this.workImages = res.data;
                            }
                        },
                        error: (err) => {
                            console.error(err);
                        },
                        complete: () => this.isLoading = false
                    })
            }
        });
    }
}