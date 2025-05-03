import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OfferedServicesService } from '../../../../../../core/services/service-management.service';
import { NotificationService } from '../../../../../../core/services/public/notification.service';
import { getValidationMessage } from '../../../../../../core/utils/form-validation.utils';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IOfferedService, ISubService } from '../../../../../../core/models/offeredService.model';
import { Store } from '@ngrx/store';
import { offeredServiceActions } from '../../../../../../store/offered-services/offeredService.action';

export interface SubService {
  id?: number;
  title: string;
  description: string;
  price: string;
  time: string;
  tag: string;
  image?: string;
  imageFile?: File;
}

@Component({
  selector: 'app-service-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './service-create.component.html',
  styleUrl: './service-create.component.scss'
})
export class ServiceCreateComponent {
  private _fb = inject(FormBuilder);
  private _serviceOfferedService = inject(OfferedServicesService);
  private _notyf = inject(NotificationService);
  private _store = inject(Store);
  private _scroller = inject(ViewportScroller);

  serviceImagePreview?: string;
  serviceImageFile?: File;
  serviceUrl?: string;
  serviceId: string | null = null;
  service!: IOfferedService;

  /**
    * Main form for managing service creation,
    * including dynamically added sub-services.
    */
  serviceForm: FormGroup = this._fb.group({
    serviceTitle: ['', Validators.required],
    serviceDesc: ['', Validators.required],
    subServices: this._fb.array<FormGroup>([]),
  });

  constructor(private route: ActivatedRoute) {
    // Subscribe to route param to get service ID (edit mode)
    this.route.paramMap.subscribe(param => {
      this.serviceId = param.get('id');
    });

    this.route.queryParams.subscribe(params => {
      if (params['subIdx'] !== undefined) {
        setTimeout(() => {
          this.scrollToSubService(+params['subIdx']);
        }, 300);
      }
    })

    // If editing, fetch the existing service details
    if (this.serviceId) {
      this._serviceOfferedService.fetchOneService(this.serviceId).subscribe({
        next: (service) => {
          this.service = service;
          this._patchServiceForm();
        },
        error: (err) => this._notyf.error(err)
      });
    }
  }

  scrollToSubService(index: number) {
    const elementId = `sub-service-${index}`;
    this._scroller.scrollToAnchor(elementId);
  }

  /**
   * Getter for accessing sub-service FormArray
   */
  get subServices(): FormArray<FormGroup> {
    return this.serviceForm.get('subServices') as FormArray<FormGroup>;
  }

  /**
   * Adds a new sub-service form group to the form
   * Only adds if existing entries are valid.
   */
  addSubService(): void {
    if (this.subServices.valid) {
      this.subServices.push(this._createSubServiceGroup());
    } else {
      this.subServices.markAllAsTouched();
      this.subServices.controls.forEach((group) => {
        for (const fieldName in group.controls) {
          const control = group.get(fieldName) as AbstractControl;
          const errorMessage = getValidationMessage(control, fieldName);
          if (errorMessage) {
            this._notyf.error(errorMessage);
            return;
          }
        }
      });
    }
  }

  /**
   * Removes a sub-service form group by index
   * @param index Index of sub-service to remove
   */
  removeSubService(index: number): void {
    this.subServices.removeAt(index);
  }

  /**
   * Handles main service image file upload
   * @param event File input change event
   */
  onServiceImageUpload(event: Event): void {
    const file = this._extractFile(event);
    if (!file) return;

    this.serviceImageFile = file;
    this._previewImage(file, (img) => this.serviceImagePreview = img);
  }

  /**
   * Handles image upload for a specific sub-service
   * @param event File input change event
   * @param subServiceIndex Index of the sub-service form group
   */
  onSubServiceImageUpload(event: Event, subServiceIndex: number): void {
    const file = this._extractFile(event);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = e.target?.result as string;
      const subServiceGroup = this.subServices.at(subServiceIndex);
      subServiceGroup.patchValue({ image: img, imageFile: file });
    };
    reader.readAsDataURL(file);
  }

  /**
   * Submits the complete service form with attached files via FormData
   */
  onSubmit(): void {
    const isEditMode = !!this.service?.id;

    if (!this.serviceImageFile && !this.service?.image && !isEditMode) {
      this._notyf.error('Service image must be uploaded before submitting.');
      return;
    }

    for (const field of ['serviceTitle', 'serviceDesc']) {
      const control = this.serviceForm.get(field) as AbstractControl;
      const errorMessage = getValidationMessage(control, field);
      if (errorMessage) {
        this._notyf.error(errorMessage);
        return;
      }
    }

    const formData = this.buildServiceFormData(isEditMode);

    if (isEditMode) {
      formData.append('id', this.service.id);
      this._store.dispatch(offeredServiceActions.updateOfferedService({ updateData: formData }));
    } else {
      this._serviceOfferedService.sendFormData(formData).subscribe({
        next: (res) => console.log(res),
        error: (err) => console.error(err)
      });
    }
  }

  /**
 * Builds and returns a FormData object from the service form.
 */
  private buildServiceFormData(isEditMode: boolean): FormData {
    const formData = new FormData();
    const formValue = this.serviceForm.value;

    // Main service fields
    formData.append('title', formValue.serviceTitle);
    formData.append('desc', formValue.serviceDesc);

    // Append new image file only if it's newly uploaded
    if (this.serviceImageFile) {
      formData.append('serviceImageFile', this.serviceImageFile);
    }

    // Sub-services handling
    formValue.subServices.forEach((sub: any, index: number) => {
      formData.append(`subServices[${index}][title]`, sub.title);
      formData.append(`subServices[${index}][desc]`, sub.desc);
      formData.append(`subServices[${index}][price]`, sub.price);
      formData.append(`subServices[${index}][estimatedTime]`, sub.estimatedTime);
      formData.append(`subServices[${index}][tag]`, sub.tag || '');

      // Append image only if user uploaded a new file
      if (sub.imageFile) {
        formData.append(`subServices[${index}][imageFile]`, sub.imageFile);
      }

      // Optionally include existing image URL for backend to keep or update
      if (isEditMode && sub.image && !sub.imageFile) {
        formData.append(`subServices[${index}][image]`, sub.image);
      }
    });

    // Optional: include existing main image URL too (if backend needs it)
    if (isEditMode && this.service?.image && !this.serviceImageFile) {
      formData.append('image', this.service.image);
    }

    return formData;
  }

  /**
  * Creates a new empty sub-service form group with validation
  */
  private _createSubServiceGroup(): FormGroup {
    return this._fb.group({
      title: ['', Validators.required],
      desc: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      estimatedTime: ['', Validators.required],
      tag: ['',],
      availability: ['',],
      image: [null],
      imageFile: [null]
    });
  }

  /**
   * Reads and previews image as a base64 string
   */
  private _previewImage(file: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  /**
   * Extracts a File object from a file input event
   */
  private _extractFile(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    return input.files?.[0] || null;
  }

  /**
     * Fills the form with existing service data in edit mode
     */
  private _patchServiceForm(): void {
    if (!this.service) return;

    this.serviceForm.patchValue({
      serviceTitle: this.service.title,
      serviceDesc: this.service.desc
    });

    const subServiceArray = this.serviceForm.get('subServices') as FormArray;
    subServiceArray.clear();

    this.service.subService.forEach((sub: any) => {
      const group = this._createSubServiceGroup();
      group.patchValue({
        title: sub.title,
        desc: sub.desc,
        price: sub.price,
        estimatedTime: sub.estimatedTime,
        tag: sub.tag,
        availability: sub.availability,
        image: sub.image || null,
        imageFile: null
      });
      subServiceArray.push(group);
    });

    this.serviceImagePreview = this.service.image;
  }
}
