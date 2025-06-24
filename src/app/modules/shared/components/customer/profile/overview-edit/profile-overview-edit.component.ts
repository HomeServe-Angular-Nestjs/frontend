import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { combineLatest, map, Observable, of, startWith } from "rxjs";
import { IAddress, ICustomer } from "../../../../../../core/models/user.model";
import { Store } from "@ngrx/store";
import { selectCustomer } from "../../../../../../store/customer/customer.selector";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { getValidationMessage } from "../../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { CustomerService } from "../../../../../../core/services/customer.service";
import { customerActions } from "../../../../../../store/customer/customer.actions";
import { API_KEY, REGEXP_ENV } from "../../../../../../environments/env";
import { MapboxMapComponent } from "../../../../partials/shared/map/map.component";
import { MapboxLocationService } from "../../../../../../core/services/public/location.service";

@Component({
    selector: 'app-customer-profile-overview',
    templateUrl: './profile-overview-edit.component.html',
    imports: [CommonModule, ReactiveFormsModule, MapboxMapComponent],
    providers: [MapboxLocationService]
})
export class CustomerProfileOverviewEditComponent implements OnInit {
    private readonly _store = inject(Store);
    private readonly _fb = inject(FormBuilder);
    private readonly _router = inject(Router);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _locationService = inject(MapboxLocationService);

    customer$: Observable<ICustomer | null> = this._store.select(selectCustomer);
    googleLogin$: Observable<boolean> = of(false);
    center: [number, number] = [76.9560, 8.5010];

    passwordRegex = REGEXP_ENV.password;
    phoneRegex = REGEXP_ENV.phone;

    private originalCustomerData!: string;

    profileForm: FormGroup = this._fb.group({
        fullname: ['', Validators.required],
        username: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(this.phoneRegex)]],
        email: ['', [Validators.required, Validators.email]],
        location: this._fb.group(
            {
                address: ['', Validators.required],
                coordinates: [[]]
            },
            {
                validators: [this.locationValidator]
            }
        )
    });

    changePasswordForm: FormGroup = this._fb.group({
        currentPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
        newPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
        confirmPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
    });

    ngOnInit(): void {
        this.customer$.subscribe(customer => {
            this.profileForm.patchValue({
                fullname: customer?.fullname,
                username: customer?.username,
                email: customer?.email,
                phone: customer?.phone,
                location: customer?.location
            });

            this.originalCustomerData = JSON.parse(JSON.stringify(this.profileForm.getRawValue()));
        });

        this.googleLogin$ = this.customer$.pipe(
            map(customer => !!customer?.googleId)
        );
    }

    private locationValidator(control: AbstractControl): ValidationErrors | null {
        const location = control.value;
        if (!location || typeof location !== 'object') return { locationInvalid: 'Location is required' };

        const hasAddress = typeof location.address === 'string' && location.address.trim().length > 0;
        const hasCoordinates = Array.isArray(location.coordinates) && location.coordinates.length === 2;

        return hasAddress && hasCoordinates ? null : { locationInvalid: 'Invalid location' };
    }

    cancelEdit() {
        this._router.navigate(['profile', 'overview']);
    }

    saveProfile() {
        this.profileForm.markAllAsTouched();
        const controls = {
            fullname: this.profileForm.get('fullname'),
            username: this.profileForm.get('username'),
            email: this.profileForm.get('email'),
            phone: this.profileForm.get('phone'),
            location: this.profileForm.get('location')
        };

        const profileDatastr = this.profileForm.getRawValue();
        const original = this.originalCustomerData;

        if (this.profileForm.valid) {
            const profileData = {
                fullname: controls.fullname?.value,
                username: controls.username?.value,
                email: controls.email?.value,
                phone: controls.phone?.value,
                location: controls.location?.value,
            }

            const hasChanged = JSON.stringify(profileDatastr) !== JSON.stringify(original);

            if (!hasChanged) {
                return;
            }

            this._store.dispatch(customerActions.updateProfile({ profileData }));

        } else {
            for (const [key, control] of Object.entries(controls)) {
                const message = getValidationMessage(control, key);
                if (message) {
                    this._toastr.error(message);
                    return;
                }
            }
        }
    }

    changePassword() {
        this.changePasswordForm.markAllAsTouched();
        const controls = {
            currentPassword: this.changePasswordForm.get('currentPassword'),
            newPassword: this.changePasswordForm.get('newPassword'),
            confirmPassword: this.changePasswordForm.get('confirmPassword'),
        }

        if (this.changePasswordForm.valid) {
            const passwordData = {
                currentPassword: controls.currentPassword?.value,
                newPassword: controls.newPassword?.value,
                confirmPassword: controls.confirmPassword?.value
            }

            if (passwordData.currentPassword === passwordData.newPassword) {
                this._toastr.error('New password should not be the same as current password.');
                return;
            }

            if (passwordData.newPassword !== passwordData.confirmPassword) {
                this._toastr.error('New password and Confirm password must match.');
                return;
            }

            this._store.dispatch(customerActions.changePassword({ passwordData }));

        } else {
            for (const [key, control] of Object.entries(controls)) {
                const message = getValidationMessage(control, key);
                if (message) {
                    this._toastr.error(message);
                    return;
                }
            }
        }
    }

    changeAddress(newCenter: [number, number]) {
        this.center = newCenter;
        this._locationService.getAddressFromCoordinates(...newCenter).subscribe({
            next: (data) => {
                const selectedAddress = data.features[0]?.place_name;

                this.profileForm.get('location')?.patchValue({
                    address: selectedAddress,
                    coordinates: newCenter
                });

            },
            error: (err) => {
                this._toastr.error('Failed to get address.');
                console.log(err);
            }
        })
    }

    onAvatarChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('customerAvatar', file);
            this._store.dispatch(customerActions.changeAvatar({ formData }));
        }
    }
}