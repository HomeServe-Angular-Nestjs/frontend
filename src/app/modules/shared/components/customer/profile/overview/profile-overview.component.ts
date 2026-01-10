import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { combineLatest, finalize, map, Observable, of, startWith, Subject, takeUntil } from "rxjs";
import { ILocation, ICustomer } from "../../../../../../core/models/user.model";
import { Store } from "@ngrx/store";
import { selectCustomer } from "../../../../../../store/customer/customer.selector";
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { getValidationMessage } from "../../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { customerActions } from "../../../../../../store/customer/customer.actions";
import { REGEXP_ENV } from "../../../../../../../environments/env";
import { MapboxMapComponent } from "../../../../partials/shared/map/map.component";
import { LocationService } from "../../../../../../core/services/public/location.service";
import { LoadingService } from "../../../../../../core/services/public/loading.service";

@Component({
    selector: 'app-customer-profile-overview',
    templateUrl: './profile-overview.component.html',
    imports: [CommonModule, ReactiveFormsModule, MapboxMapComponent],
    providers: [LocationService]
})
export class CustomerProfileOverviewComponent implements OnInit, OnDestroy {
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _locationService = inject(LocationService);
    private readonly _loadingService = inject(LoadingService);
    private readonly _fb = inject(FormBuilder);
    // private readonly _router = inject(Router); // Not needed for navigation between overview and edit anymore
    private readonly _store = inject(Store);

    private _destroy$ = new Subject<void>();
    private _originalCustomerData!: string;

    isEditing = false;
    isLoading = true;

    customer$: Observable<ICustomer | null> = this._store.select(selectCustomer);
    googleLogin$: Observable<boolean> = of(false);
    center: [number, number] = [76.9560, 8.5010];
    showMap = false;

    passwordRegex = REGEXP_ENV.password;
    phoneRegex = REGEXP_ENV.phone;

    profileForm: FormGroup = this._fb.group({
        fullname: ['', Validators.required],
        username: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(this.phoneRegex)]],
        email: ['', [Validators.required, Validators.email]],
        address: ['', Validators.required],
        coordinates: [[], Validators.required]
    });

    changePasswordForm: FormGroup = this._fb.group({
        currentPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
        newPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
        confirmPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
    });

    ngOnInit(): void {
        this.customer$
            .pipe(
                takeUntil(this._destroy$)
            ).subscribe(customer => {
                if (customer) this.isLoading = false;

                if (!customer?.address) this.showMap = true;

                this.profileForm.patchValue({
                    fullname: customer?.fullname,
                    username: customer?.username,
                    email: customer?.email,
                    phone: customer?.phone,
                    coordinates: customer?.location?.coordinates,
                    address: customer?.address
                });

                this._originalCustomerData = JSON.parse(JSON.stringify(this.profileForm.getRawValue()));
            });

        this.googleLogin$ = this.customer$.pipe(
            map(customer => !!customer?.googleId)
        );
    }

    toggleEditMode() {
        this.isEditing = !this.isEditing;
        if (!this.isEditing) {
            // If cancelling, reset data
            if (this._originalCustomerData) {
                this.profileForm.patchValue(JSON.parse(this._originalCustomerData));
            }
        }
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onImageError(event: Event) {
        (event.target as HTMLImageElement).src = 'assets/images/profile_placeholder.jpg';
    }

    saveProfile() {
        this.profileForm.markAllAsTouched();
        const controls = {
            fullname: this.profileForm.get('fullname'),
            username: this.profileForm.get('username'),
            email: this.profileForm.get('email'),
            phone: this.profileForm.get('phone'),
            address: this.profileForm.get('address'),
            coordinates: this.profileForm.get('coordinates')
        };

        const profileDataStr = this.profileForm.getRawValue();
        const original = this._originalCustomerData ? JSON.parse(this._originalCustomerData) : {};

        if (this.profileForm.valid) {
            const profileData = {
                fullname: controls.fullname?.value,
                username: controls.username?.value,
                phone: controls.phone?.value,
                address: controls.address?.value,
                coordinates: controls.coordinates?.value,
            }

            const hasChanged = JSON.stringify(profileDataStr) !== JSON.stringify(original);

            if (!hasChanged) {
                this.isEditing = false;
                return;
            }

            this._store.dispatch(customerActions.updateProfile({ profileData }));
            this.isEditing = false; // Exit edit mode on save
            return;
        }

        const validate = (formGroup: FormGroup): string | null => {
            for (const [key, control] of Object.entries(formGroup.controls)) {
                if (control instanceof FormGroup) {
                    const nestedError = validate(control);
                    if (nestedError) return nestedError;
                } else if (control instanceof FormControl) {
                    const message = getValidationMessage(control, key);
                    if (message) {
                        return message; // Return directly
                    }
                }
            }
            return null;
        };

        const firstError = validate(this.profileForm);

        if (firstError) {
            this._toastr.error(firstError);
            return;
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
            this.changePasswordForm.reset(); // clear form

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
                this.profileForm.patchValue({
                    address: selectedAddress,
                    coordinates: this.center
                });
            },
            error: (err) => {
                this._toastr.error('Failed to get address.');
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