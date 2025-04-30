import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getValidationMessage } from '../../../../../../core/utils/form-validation.utils';
import { NotificationService } from '../../../../../../core/services/public/notification.service';
import { Day, IProvider } from '../../../../../../core/models/user.model';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { firstValueFrom, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectProvider } from '../../../../../../store/provider/provider.selector';
import { providerActions } from '../../../../../../store/provider/provider.action';

export interface profile {
  fullName: string,
  profession: string,
  avatar: string | File
  location: string,
  serviceRadius: number,
  experience: number,
  licensed: true,
  workingDays: {
    start: string,
    end: string
  },
  workingHours: {
    start: string,
    end: string
  },
  emergencyAvailable: boolean,
};

@Component({
  selector: 'app-provider-edit-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './provider-edit-overview.component.html',
})
export class ProviderEditOverviewComponent implements OnInit {
  provider$!: Observable<IProvider | null>;

  private _router = inject(Router);
  private _fb = inject(FormBuilder);
  private _notyf = inject(NotificationService);
  private _providerService = inject(ProviderService);

  previewImage!: string;
  emergency = false;
  daysOfWeek: Day[] = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
  profileImage!: File;
  selectedLocation: string = '';
  provider!: IProvider | null;

  profileForm: FormGroup = this._fb.group({
    fullname: ['', Validators.required],
    profession: ['', Validators.required],
    experience: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
    location: ['', Validators.required],
    serviceRadius: ['', [Validators.min(1), Validators.max(100)]],
    workingDaysStart: ['', Validators.required],
    workingDaysEnd: ['', Validators.required],
    workingHoursStart: ['', Validators.required],
    workingHoursEnd: ['', Validators.required],
  });

  constructor(private store: Store) {
    this.provider$ = this.store.select(selectProvider);
  }

  async ngOnInit() {
    this.provider = await firstValueFrom(this.provider$);

    if (this.provider) {
      this.profileForm.patchValue({
        fullname: this.provider.fullname,
        profession: this.provider.profession,
        experience: this.provider.experience,
        location: this.provider.location,
        serviceRadius: this.provider.serviceRadius,
        workingDaysStart: this.provider.availability?.day?.from,
        workingDaysEnd: this.provider.availability?.day?.to,
        workingHoursStart: this.provider.availability?.time?.from,
        workingHoursEnd: this.provider.availability?.time?.to,
      });

      console.log(this.provider)
    }
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileImage = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target?.result as string;
      }
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    const controls = {
      fullname: this.profileForm.get('fullname'),
      profession: this.profileForm.get('profession'),
      experience: this.profileForm.get('experience'),
      location: this.profileForm.get('location'),
      serviceRadius: this.profileForm.get('serviceRadius'),
      workingDaysStart: this.profileForm.get('workingDaysStart'),
      workingDaysEnd: this.profileForm.get('workingDaysEnd'),
      workingHoursStart: this.profileForm.get('workingHoursStart'),
      workingHoursEnd: this.profileForm.get('workingHoursEnd'),
    };

    if (this.profileForm.valid) {
      const provider: Partial<IProvider> = {
        fullname: controls.fullname?.value,
        profession: controls.profession?.value,
        experience: controls.experience?.value,
        serviceRadius: controls.serviceRadius?.value,
        availability: {
          day: {
            from: controls.workingDaysStart?.value,
            to: controls.workingDaysEnd?.value
          },
          time: {
            from: controls.workingHoursStart?.value,
            to: controls.workingHoursEnd?.value
          }
        }
      }

      const formData = new FormData();

      formData.append('providerData', JSON.stringify(provider));
      formData.append('providerAvatar', this.profileImage);

      this.store.dispatch(providerActions.updateProvider({ updateProviderData: formData }));

      // this.providerService.updateProviderData(formData).subscribe({
      //   next: () => {
      //     this.notyf.success('Profile updated Successfully');
      //     this.router.navigate(['provider', 'profiles', 'overview']);
      //   },
      //   error: (err) => this.notyf.error(err)
      // });

    } else {
      this.profileForm.markAllAsTouched();
      for (const [key, control] of Object.entries(controls)) {
        const message = getValidationMessage(control, key);
        if (message) {
          this._notyf.error(message);
          return;
        }
      }
    }
  }

  cancelEdit() {
    this._router.navigate(['provider', 'profiles'])
  }
}
