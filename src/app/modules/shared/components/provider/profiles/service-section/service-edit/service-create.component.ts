import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OfferedServicesService } from '../../../../../../../core/services/service-management.service';
import { NotificationService } from '../../../../../../../core/services/public/notification.service';
import { getValidationMessage } from '../../../../../../../core/utils/form-validation.utils';
import { RouterLink } from '@angular/router';

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
  private fb = inject(FormBuilder);
  private serviceOfferedService = inject(OfferedServicesService);
  private notyf = inject(NotificationService);

  serviceImagePreview?: string;
  serviceImageFile?: File;
  serviceUrl?: string;

  // Main form group combining service and sub-services
  serviceForm: FormGroup = this.fb.group({
    serviceTitle: ['', Validators.required],
    serviceDesc: ['', Validators.required],
    subServices: this.fb.array<FormGroup>([])
  });

  // Getter for sub-services
  get subServices(): FormArray<FormGroup> {
    return this.serviceForm.get('subServices') as FormArray<FormGroup>;
  }

  // Add a new sub-service if all existing are valid
  addSubService(): void {
    if (this.subServices.valid) {
      this.subServices.push(this.createSubServiceGroup());
    } else {
      this.subServices.markAllAsTouched();
      this.subServices.controls.forEach((group, index) => {
        for (const fieldName in group.controls) {
          const control = group.get(fieldName) as AbstractControl;
          const errorMessage = getValidationMessage(control, fieldName);
          if (errorMessage) {
            this.notyf.error(errorMessage);
            return;
          }
        }
      });
    }
  }

  // Remove a sub-service at a specific index
  removeSubService(index: number): void {
    this.subServices.removeAt(index);
  }

  // Upload main service image
  onServiceImageUpload(event: Event): void {
    const file = this.extractFile(event);
    if (!file) return;

    this.serviceImageFile = file;
    this.previewImage(file, (img) => this.serviceImagePreview = img);
  }

  // Upload sub-service image and set it in the corresponding form group
  onSubServiceImageUpload(event: Event, subServiceIndex: number): void {
    const file = this.extractFile(event);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = e.target?.result as string;
      const subServiceGroup = this.subServices.at(subServiceIndex);
      subServiceGroup.patchValue({ image: img, imageFile: file });
    };
    reader.readAsDataURL(file);
  }

  // Form submission logic
  onSubmit(): void {
    if (!this.serviceImageFile) {
      this.notyf.error('Service image must be uploaded before submitting.');
      return;
    }

    ['serviceTitle', 'serviceDesc'].forEach(field => {
      const control = this.serviceForm.get(field) as AbstractControl;
      const errorMessage = getValidationMessage(control, field);
      if (errorMessage) {
        this.notyf.error(errorMessage);
        return;
      }
    });

    const formData = new FormData();

    // Add main service fields
    formData.append('serviceTitle', this.serviceForm.value.serviceTitle);
    formData.append('serviceDesc', this.serviceForm.value.serviceDesc);
    formData.append('serviceImageFile', this.serviceImageFile);

    // Add sub-services as indexed fields
    this.serviceForm.value.subServices.forEach((sub: any, index: number) => {
      // Append individual fields with indexing
      formData.append(`subServices[${index}][title]`, sub.title);
      formData.append(`subServices[${index}][desc]`, sub.desc);
      formData.append(`subServices[${index}][price]`, sub.price);
      formData.append(`subServices[${index}][estimatedTime]`, sub.estimatedTime);
      formData.append(`subServices[${index}][tag]`, sub.tag || '');

      // Append image if it exists
      if (sub.imageFile) {
        formData.append(`subServices[${index}][imageFile]`, sub.imageFile);
      }
    });

    this.serviceOfferedService.sendFormData(formData).subscribe({
      next: (res) => console.log(res),
      error: (err) => console.error(err)
    });
  }

  // Utility to create a new sub-service group
  private createSubServiceGroup(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      desc: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      estimatedTime: ['', Validators.required],
      tag: ['', Validators.required],
      availability: ['', Validators.required],
      image: [null],
      imageFile: [null]
    });
  }

  // Generic image preview utility
  private previewImage(file: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  // Extract file from input event
  private extractFile(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    return input.files?.[0] || null;
  }
}
