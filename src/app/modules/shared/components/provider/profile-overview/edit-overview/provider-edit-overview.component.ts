import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getValidationMessage } from '../../../../../../core/utils/form-validation.utils';
import { Day, IProvider } from '../../../../../../core/models/user.model';
import { firstValueFrom, Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectProvider } from '../../../../../../store/provider/provider.selector';
import { providerActions } from '../../../../../../store/provider/provider.action';
import { MapboxMapComponent } from "../../../../partials/shared/map/map.component";
import { API_KEY } from '../../../../../../../environments/env';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { CategoryService } from '../../../../../../core/services/category.service';
import { IProfession } from '../../../../../../core/models/category.model';

@Component({
  selector: 'app-provider-edit-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MapboxMapComponent],
  templateUrl: './provider-edit-overview.component.html',
})
export class ProviderEditOverviewComponent implements OnInit, OnDestroy {
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _categoryService = inject(CategoryService);
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _destroy$ = new Subject<void>();

  provider$!: Observable<IProvider | null>;
  previewImage: string | undefined = '';
  emergency = false;
  daysOfWeek: Day[] = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
  profileImage!: File;
  provider!: IProvider | null;
  center: [number, number] = [76.9560, 8.5010];
  zoom = 12;
  selectedAddress: string = '';
  professions: IProfession[] = [];

  readonly mapboxToken = API_KEY.mapbox;

  profileForm: FormGroup = this._fb.group({
    fullname: ['', Validators.required],
    profession: ['', Validators.required],
    experience: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
    location: [null, Validators.required],
    address: ['', Validators.required],
    serviceRadius: ['', [Validators.min(1), Validators.max(100)]],
    workingDaysStart: ['', Validators.required],
    workingDaysEnd: ['', Validators.required],
    workingHoursStart: ['', Validators.required],
    workingHoursEnd: ['', Validators.required],
  });

  constructor(private store: Store) {
    this.provider$ = this.store.select(selectProvider)
      .pipe(takeUntil(this._destroy$));

    this._categoryService.getProfessions()
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }

  async ngOnInit() {
    this._categoryService.professions$
      .pipe(takeUntil(this._destroy$))
      .subscribe(professions => {
        this.professions = professions;
      });

    this.provider = await firstValueFrom(this.provider$);
    this.previewImage = this.provider?.avatar;

    if (this.provider) {
      this.profileForm.patchValue({
        fullname: this.provider.fullname,
        profession: this.provider.profession,
        experience: this.provider.experience,
        location: this.provider.location,
        address: this.provider.address,
        serviceRadius: this.provider.serviceRadius,
        workingDaysStart: this.provider.availability?.day?.from,
        workingDaysEnd: this.provider.availability?.day?.to,
        workingHoursStart: this.provider.availability?.time?.from,
        workingHoursEnd: this.provider.availability?.time?.to,
      });
    }

    const location = this.provider?.location;
    if (location && location.coordinates.length) {
      this.onMapLocationChanged(location.coordinates);
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
      address: this.profileForm.get('address'),
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
        },
        location: controls.location?.value,
        address: controls.address?.value,
        avatar: this.provider?.avatar,
      }

      const formData = new FormData();

      formData.append('providerData', JSON.stringify(provider));
      formData.append('providerAvatar', this.profileImage);

      this.store.dispatch(providerActions.updateProvider({ updateProviderData: formData }));
    } else {
      this.profileForm.markAllAsTouched();
      for (const [key, control] of Object.entries(controls)) {
        const message = getValidationMessage(control, key);
        if (message) {
          this._toastr.error(message);
          return;
        }
      }
    }
  }

  async onMapLocationChanged(newCenter: [number, number]) {
    this.center = newCenter;
    const [lng, lat] = newCenter;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxToken}`
    );
    const data = await response.json();
    this.selectedAddress = data.features[0]?.place_name || 'No address found';

    const location = {
      type: 'Point',
      coordinates: [lng, lat],
    }

    this.profileForm.get('location')?.setValue(location);
    this.profileForm.get('address')?.setValue(this.selectedAddress);
  }

  cancelEdit() {
    this._router.navigate(['provider', 'profiles'])
  }

  private _fetchProfessions() {

  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
