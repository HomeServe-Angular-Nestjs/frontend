import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { OfferedServicesService } from '../../../../../../core/services/service-management.service';
import { getValidationMessage } from '../../../../../../core/utils/form-validation.utils';
import { IOfferedService } from '../../../../../../core/models/offeredService.model';
import { Store } from '@ngrx/store';
import { providerActions } from '../../../../../../store/provider/provider.action';
import { map } from 'rxjs';
import { REGEXP_ENV } from '../../../../../../../environments/env';
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";

@Component({
  selector: 'app-service-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, LoadingCircleAnimationComponent],
  templateUrl: './service-create.component.html',
  styleUrl: './service-create.component.scss'
})
export class ServiceCreateComponent implements OnInit {
  private readonly _serviceOfferedService = inject(OfferedServicesService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _fb = inject(FormBuilder);
  private readonly _scroller = inject(ViewportScroller);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _store = inject(Store);

  private readonly _validDecimal = REGEXP_ENV.decimals;
  private readonly _validInteger = REGEXP_ENV.integers;

  @ViewChild('addSubServiceBtn', { static: false }) buttonElementRef!: ElementRef<HTMLButtonElement>;

  serviceImagePreview?: string;
  serviceImageFile?: File;
  serviceUrl?: string;
  serviceId!: string
  service!: IOfferedService;

  isLoading = false;
  loadingColor = 'green';
  loadingText = 'Processing...';

  serviceForm: FormGroup = this._fb.group({
    serviceTitle: ['', Validators.required],
    serviceDesc: ['', Validators.required],
    subServices: this._fb.array<FormGroup>([]),
  });

  // Getter for accessing sub-service FormArray
  get subServices(): FormArray<FormGroup> {
    return this.serviceForm.get('subServices') as FormArray<FormGroup>;
  }

  ngOnInit() {
    // Subscribe to route param to get service ID (edit mode)
    this._route.paramMap.subscribe(param => {
      this.serviceId = param.get('id') ?? '';
    });

    this._route.queryParams.subscribe(params => {
      if (params['subIdx'] !== undefined) {
        setTimeout(() => {
          this._scrollToSubService(+params['subIdx']);
        }, 300);
      }

      if (params['addSs']) {
        setTimeout(() => {
          this._scrollToAddSubService();
        })
      }
    });

    // If editing, fetch the existing service details
    if (this.serviceId) {
      this._serviceOfferedService.fetchOneService(this.serviceId).pipe(
        map(service => ({
          ...service,
          subService: service.subService.filter(sub => !sub.isDeleted)
        }))
      ).subscribe({
        next: (service) => {
          this.service = service;
          this._patchServiceForm();
        },
        error: (err) => this._toastr.error(err)
      });
    }
  }

  private _validateSubService(): boolean {
    let isValid = true;

    this.subServices.controls.forEach((group) => {
      const image = group.controls['image']?.value;
      const imageUrl = group.controls['imageUrl']?.value;

      if (!image && !imageUrl) {
        this._toastr.error('Sub service image is required.');
        isValid = false;
        return;
      }

      for (const fieldName in group.controls) {
        const control = group.get(fieldName) as AbstractControl;
        const errorMessage = getValidationMessage(control, fieldName);

        if (errorMessage) {
          this._toastr.error(errorMessage);
          isValid = false;
          return;
        }
      }
    });

    return isValid;
  }

  private _createService(formData: FormData) {
    this._serviceOfferedService.createService(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this._afterSuccess(response.message);
          this._store.dispatch(providerActions.updateProviderOfferedServices({ offeredServices: response.data ?? [] }));
        } else {
          this._toastr.error(response.message);
        }
      },
      error: (err) => {
        this._toastr.error('Oops, something went wrong.');
        console.error(err);
      },
      complete: () => this.isLoading = false
    });
  }

  private _editService(formData: FormData) {
    formData.append('id', this.serviceId);

    this._serviceOfferedService.updateService(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this._afterSuccess(response.message);
        } else {
          this._toastr.error('failed to update service.');
        }
      },
      error: (err) => {
        this._toastr.error('Oops, Something happened');
        console.error(err)
      },
      complete: () => this.isLoading = false
    });
  }

  // Builds and returns a FormData object from the service form.
  private _buildServiceFormData(isEditMode: boolean): FormData {
    const formData = new FormData();
    const formValue = this.serviceForm.value;

    // Main service fields
    formData.append('title', formValue.serviceTitle);
    formData.append('desc', formValue.serviceDesc);

    // Append new image file only if it's newly uploaded
    if (this.serviceImageFile) {
      formData.append('image', this.serviceImageFile);
    }

    // Sub-services handling
    formValue.subServices.forEach((sub: any, index: number) => {
      formData.append(`subService[${index}][title]`, sub.title);
      formData.append(`subService[${index}][desc]`, sub.desc);
      formData.append(`subService[${index}][price]`, sub.price);

      const estimatedTime = sub.estimatedTime + ' ' + sub.durationOptions;
      formData.append(`subService[${index}][estimatedTime]`, estimatedTime);

      // Append image only if user uploaded a new file
      if (sub.imageFile) {
        formData.append(`subService[${index}][image]`, sub.imageFile);
      }

      // include existing image URL for backend to keep or update
      if (isEditMode && sub.image && !sub.imageFile) {
        formData.append(`subService[${index}][image]`, sub.image);
      }
    });

    // include existing main image URL
    if (isEditMode && this.service?.image && !this.serviceImageFile) {
      formData.append('image', this.service.image);
    }

    return formData;
  }

  // Creates a new empty sub-service form group with validation
  private _createSubServiceGroup(): FormGroup {
    return this._fb.group({
      title: ['', Validators.required],
      desc: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern(this._validDecimal)]],
      estimatedTime: ['', [Validators.required, Validators.pattern(this._validInteger)]],
      durationOptions: ['', Validators.required],
      image: [null],
      imageFile: [null],
    });
  }

  // Reads and previews image as a base64 string
  private _previewImage(file: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  // Extracts a File object from a file input event
  private _extractFile(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    return input.files?.[0] || null;
  }

  // Fills the form with existing service data in edit mode
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
      const [estimatedTime, durationOptions] = sub.estimatedTime.split(' ');
      group.patchValue({
        title: sub.title,
        desc: sub.desc,
        price: sub.price,
        estimatedTime,
        durationOptions,
        image: sub.image || null,
        imageFile: null
      });
      subServiceArray.push(group);
    });

    this.serviceImagePreview = this.service.image;
  }

  private _afterSuccess(message: string) {
    this._toastr.success(message);
    this._router.navigate(['provider', 'profiles', 'service_offered'])
  }

  private _scrollToSubService(index: number) {
    const elementId = `sub-service-${index}`;
    this._scroller.scrollToAnchor(elementId);
  }

  private _scrollToAddSubService() {
    const button = this.buttonElementRef?.nativeElement;
    if (button) {
      button.scrollIntoView({ behavior: 'smooth', block: 'center' });

      button.classList.add('glow-blink');

      setTimeout(() => {
        button.classList.remove('glow-blink');
      }, 2000);
    }
  }

  // Adds a new sub-service form group to the form
  // Only adds if existing entries are valid.
  addSubService(): void {
    this.serviceForm.markAllAsTouched();

    if (this.subServices.valid) {
      this.subServices.push(this._createSubServiceGroup());
    } else {
      this._validateSubService();
    }
  }

  // Removes a sub-service form group by index
  removeSubService(index: number): void {
    this.subServices.removeAt(index);
  }

  // Handles main service image file upload
  onServiceImageUpload(event: Event): void {
    const file = this._extractFile(event);
    if (!file) return;

    this.serviceImageFile = file;
    this._previewImage(file, (img) => this.serviceImagePreview = img);
  }

  // Handles image upload for a specific sub-service
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

  // Submits the complete service form with attached files via FormData
  onSubmit(): void {
    const isEditMode = !!this.service?.id;

    if (!this.serviceImageFile && !this.service?.image && !isEditMode) {
      this._toastr.error('Service image must be uploaded before submitting.');
      return;
    }

    for (const field of ['serviceTitle', 'serviceDesc']) {
      const control = this.serviceForm.get(field) as AbstractControl;
      const errorMessage = getValidationMessage(control, field);
      if (errorMessage) {
        this._toastr.error(errorMessage);
        return;
      }
    }

    if (!this._validateSubService()) return;

    this.isLoading = true;
    const formData = this._buildServiceFormData(isEditMode);

    if (isEditMode) {
      this._editService(formData);
    } else {
      this._createService(formData);
    }
  }
}
