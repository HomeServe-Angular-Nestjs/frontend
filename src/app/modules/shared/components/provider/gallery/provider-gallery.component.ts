import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { CommonModule } from "@angular/common";
import { UploadType } from "../../../../../core/enums/enums";
import { ProviderService } from "../../../../../core/services/provider.service";
import { map, Observable, switchMap } from "rxjs";
import { selectWorkImages } from "../../../../../store/provider/provider.selector";
import { providerActions } from "../../../../../store/provider/provider.action";
import { ToastNotificationService } from "../../../../../core/services/public/toastr.service";

@Component({
    selector: 'app-provider-gallery',
    templateUrl: './provider-gallery.component.html',
    imports: [CommonModule],
})
export class ProviderGalleryComponent implements OnInit {
    private readonly _store = inject(Store);
    private readonly _providerService = inject(ProviderService);
    private readonly _toastr = inject(ToastNotificationService);

    workImages: string[] = [];
    isUploading = false;

    ngOnInit(): void {
        this._getImageUrls();
    }

    private _getImageUrls() {
        this._providerService.getWorkImages().subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.workImages = res.data;
                } else {
                    this._toastr.error(res.message);
                }
            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    uploadImage(event: Event) {
        this.isUploading = true;
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            const formData = new FormData();

            formData.append('gallery_image', file);
            formData.append('type', UploadType.GALLERY);

            this._providerService.uploadImage(formData).subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.workImages.unshift(res.data);
                        this._toastr.success(res.message);
                    } else {
                        this._toastr.error(res.message);
                    }
                },
                error: (err) => {
                    this._toastr.error('Failed to upload image.');
                    console.error(err);
                },
                complete: () => this.isUploading = false
            })
        }
    }
}