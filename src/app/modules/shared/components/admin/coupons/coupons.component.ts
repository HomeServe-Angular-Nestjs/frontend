import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, switchMap, finalize } from 'rxjs';
import { CouponService } from '../../../../../core/services/coupon.service';
import { ToastNotificationService } from '../../../../../core/services/public/toastr.service';
import { ICoupon, ICouponFilter } from '../../../../../core/models/coupon.model';
import { IPagination } from '../../../../../core/models/booking.model';
import { DiscountTypeEnum, UsageTypeEnum } from '../../../../../core/enums/enums';
import { getToday, toDateInputValue, toIso } from '../../../../../core/utils/date.util';
import { getValidationMessage, minDateValidator } from '../../../../../core/utils/form-validation.utils';
import { DiscountSymbolPipe } from '../../../../../core/pipes/discount-symbol.pipe';
import { CouponValidityPipe } from '../../../../../core/pipes/coupon-validity.pipe';
import { AdminPaginationComponent } from '../../../partials/sections/admin/pagination/pagination.component';
import { DebounceService } from '../../../../../core/services/public/debounce.service';
import { LoadingSpinnerComponent } from '../../../../../UI/spinner/spinner.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../partials/shared/confirm-dialog-box/confirm-dialog.component';
import { SharedDataService } from '../../../../../core/services/public/shared-data.service';
import { IProfession, IServiceCategory } from '../../../../../core/models/category.model';
import { LoadingCircleAnimationComponent } from "../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";
import { CategoryService } from '../../../../../core/services/category.service';

@Component({
  selector: 'app-admin-coupons',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DiscountSymbolPipe,
    CouponValidityPipe,
    AdminPaginationComponent,
    LoadingCircleAnimationComponent
  ],
  templateUrl: './coupons.component.html',
  providers: [DebounceService],
})
export class AdminCouponsComponent implements OnInit, OnDestroy {

  private readonly _sharedService = inject(SharedDataService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _debounceService = inject(DebounceService);
  private readonly _categoryService = inject(CategoryService);
  private readonly _couponService = inject(CouponService);
  private readonly _dialog = inject(MatDialog);
  private readonly _fb = inject(FormBuilder);

  private _destroy$ = new Subject<void>();

  readonly discountTypes = Object.values(DiscountTypeEnum);
  readonly usageTypes = Object.values(UsageTypeEnum);
  readonly today = getToday();

  professions$ = this._categoryService.professions$;
  serviceCategories = signal<IServiceCategory[]>([]);

  coupons = signal<ICoupon[]>([]);
  loading = signal(false);
  isModalOpen = signal(false);
  isValidityVisible = signal(true);
  isGeneratingCode = signal(false);
  isEditing = signal(false);
  editCouponId = signal<string | null>(null);

  couponFilter = signal<ICouponFilter>({
    discountType: 'all',
    isActive: 'all',
    search: '',
    usageType: 'all',
  });

  pagination = signal<IPagination>({
    page: 1,
    limit: 10,
    total: 1
  });

  couponForm: FormGroup = this._fb.group({
    couponCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    couponName: ['', [Validators.required, Validators.minLength(3)]],
    discountType: ['', Validators.required],
    discountValue: [1, [Validators.required, Validators.min(1)]],
    usageType: ['', Validators.required],
    usageValue: [1, [Validators.required, Validators.min(1)]],
    validFrom: [this.today, [minDateValidator()]],
    validTo: ['', [minDateValidator()]],
    professionId: [''],
    serviceCategoryId: [{ value: '', disabled: true }],
    isActive: [true]
  });

  ngOnInit(): void {
    this._sharedService.setAdminHeader('Coupon Management');

    this._fetchCoupons();

    this._categoryService.getProfessions()
      .pipe(takeUntil(this._destroy$))
      .subscribe();

    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.onFilterChange());

    this.couponForm.get('usageType')?.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(type => {
        if (type === UsageTypeEnum.OneTime) {
          this._disableValidityDates();
          this._disableUsageLimit();
        } else {
          this._enableValidityDates();
          this._enableUsageLimit();
        }
      });

    this.couponForm.get('discountType')?.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(type => this._updateDiscountValidators(type));

    this.couponForm.get('professionId')?.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(professionId => {
        const categoryCtrl = this.couponForm.get('serviceCategoryId');
        if (!professionId) {
          categoryCtrl?.disable();
          categoryCtrl?.setValue('');
          this.serviceCategories.set([]);
        } else {
          // clearing only if the new profession is different from what might have been loaded
          if (!this.isEditing() || categoryCtrl?.value === '') {
             categoryCtrl?.setValue('');
          }
          categoryCtrl?.enable();
          this._categoryService.fetchAvailableServiceByProfessionId(professionId)
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => {
              if (res.data) {
                this.serviceCategories.set(res.data);
              }
            });
        }
      });
  }

  changePage(page: number) {
    this._fetchCoupons(page);
  }

  onFilterChange() {
    this._fetchCoupons(1);
  }

  onSearch() {
    this._debounceService.delay(this.couponFilter().search);
  }

  toggleModal() {
    this._resetForm();
    this.isModalOpen.update(v => !v);
  }

  generateCouponCode() {
    if (this.isGeneratingCode()) return;

    this.isGeneratingCode.set(true);

    this._couponService.generateCouponCode()
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => this.isGeneratingCode.set(false))
      )
      .subscribe({
        next: res => {
          this.couponForm.patchValue({ couponCode: res.data });
        },
      });
  }

  submitCouponForm() {
    this.couponForm.markAllAsTouched();

    if (!this.couponForm.valid) {
      for (const key of Object.keys(this.couponForm.controls)) {
        const control = this.couponForm.get(key);
        if (control?.invalid) {
          const msg = getValidationMessage(control, key);
          if (msg) {
            this._toastr.error(msg);
            return;
          }
        }
      }
      return;
    }

    const raw = this.couponForm.getRawValue();

    const payload: ICoupon = {
      ...raw,
      serviceCategoryId: raw.serviceCategoryId || undefined,
      validFrom: raw.usageType === UsageTypeEnum.Expiry ? toIso(raw.validFrom) : null,
      validTo: raw.usageType === UsageTypeEnum.Expiry ? toIso(raw.validTo) : null
    };

    if (this.isEditing()) {
      const couponId = this.editCouponId();
      if (!couponId) {
        this._toastr.error('Failed to edit coupon.');
        return;
      }

      this._couponService.editCoupon(couponId, payload)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            const coupon = res.data;
            if (!coupon) return;
            this.coupons.update(coup => coup.map(c => {
              return c.id === couponId
                ? coupon
                : c
            }));
            this.isModalOpen.set(false);
            this.isEditing.set(false);
            this.editCouponId.set(null);
            this._toastr.success('Coupon updated successfully');
          }
        });
      return;
    }

    this._couponService.createCoupon(payload)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          const coupon = res.data;
          if (!coupon) return;
          this.coupons.update(c => [coupon, ...c]);
          this.isModalOpen.set(false);
          this._toastr.success('Coupon created successfully');
        }
      });
  }

  trackByCouponId(_: number, coupon: ICoupon) {
    return coupon.id;
  }

  editCoupon(coupon: ICoupon) {
    this.isEditing.set(true);
    this.editCouponId.set(coupon.id);

    const validFrom = coupon.validFrom ? toDateInputValue(coupon.validFrom) : null;
    const validTo = coupon.validTo ? toDateInputValue(coupon.validTo) : null;

    if (coupon.usageType === UsageTypeEnum.Expiry) {
      this._enableValidityDates();
    } else {
      this._disableValidityDates();
    }

    // First patch the profession to trigger service categories load
    this.couponForm.patchValue({
      professionId: coupon.professionId || '',
      couponCode: coupon.couponCode,
      couponName: coupon.couponName,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      usageType: coupon.usageType,
      usageValue: coupon.usageValue,
      validFrom,
      validTo,
      isActive: coupon.isActive
    });

    // If there's a category, we need to wait for categories to load or just patch it if they are already there
    // Since _categoryService might take time, we can subscribe to the call once
    if (coupon.professionId) {
      this._categoryService.fetchAvailableServiceByProfessionId(coupon.professionId)
        .pipe(takeUntil(this._destroy$))
        .subscribe(res => {
          if (res.data) {
            this.serviceCategories.set(res.data);
            this.couponForm.get('serviceCategoryId')?.enable();
            this.couponForm.patchValue({
              serviceCategoryId: coupon.serviceCategoryId || ''
            });
          }
        });
    }

    this.isModalOpen.set(true);
  }

  deleteCoupon(couponId: string) {
    this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Coupon',
        message: `Are you sure you want to remove the coupon?`
      }
    })
      .afterClosed()
      .pipe(takeUntil(this._destroy$))
      .subscribe(confirm => {
        if (!confirm) return;
        this._couponService.deleteCoupon(couponId)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: (res) => {
              if (!res.success) {
                this._toastr.error(res.message);
                return;
              }

              this.coupons.update(coup => coup.filter(c => c.id !== couponId));
              this._toastr.success('Coupon deleted successfully');
            }
          });
      });
  }

  toggleCouponStatus(couponId: string) {
    this._couponService.toggleCouponStatus(couponId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.coupons.update(coup => coup.map(c => {
              if (c.id === couponId) {
                return { ...c, isActive: !c.isActive };
              }
              return c;
            }));
            this._toastr.success('Status updated successfully');
          }
        }
      });
  }

  private _disableValidityDates() {
    this.couponForm.get('validFrom')?.disable();
    this.couponForm.get('validTo')?.disable();
    this.couponForm.patchValue({ validFrom: null, validTo: null });
    this.isValidityVisible.set(false);
  }

  private _enableValidityDates() {
    this.couponForm.get('validFrom')?.enable();
    this.couponForm.get('validTo')?.enable();
    this.couponForm.patchValue({ validFrom: this.today, validTo: '' });
    this.isValidityVisible.set(true);
  }

  private _disableUsageLimit() {
    this.couponForm.get('usageValue')?.disable();
    this.couponForm.patchValue({ usageValue: 1 });
  }

  private _enableUsageLimit() {
    this.couponForm.get('usageValue')?.enable();
  }

  private _updateDiscountValidators(type: DiscountTypeEnum) {
    const control = this.couponForm.get('discountValue');
    if (!control) return;

    const map = {
      [DiscountTypeEnum.Percentage]: [Validators.required, Validators.min(0), Validators.max(100)],
      [DiscountTypeEnum.Flat]: [Validators.required, Validators.min(0)]
    };

    control.setValidators(map[type]);
    control.updateValueAndValidity();
  }

  private _resetForm() {
    this.couponForm.reset({
      couponCode: '',
      couponName: '',
      discountType: '',
      discountValue: 1,
      usageType: '',
      usageValue: 1,
      validFrom: this.today,
      validTo: '',
      professionId: '',
      serviceCategoryId: '',
      isActive: true
    });

    this.serviceCategories.set([]);
    this.couponForm.get('serviceCategoryId')?.disable();
    this._enableUsageLimit();
    this._enableValidityDates();
    this.isEditing.set(false);
    this.editCouponId.set(null);
  }

  private _fetchCoupons(page: number = 1) {
    this.loading.set(true);

    this._couponService
      .getAllCoupon(this.couponFilter(), {
        page,
        limit: this.pagination().limit
      })
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          if (!res.data) return;

          this.coupons.set(res.data.coupons);
          this.pagination.set(res.data.pagination);
        },
        error: () => this.loading.set(false),
        complete: () => this.loading.set(false)
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
