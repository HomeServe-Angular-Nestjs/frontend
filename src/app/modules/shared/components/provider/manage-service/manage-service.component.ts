import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { IProviderService } from '../../../../../core/models/provider-service.model';
import { ToastNotificationService } from '../../../../../core/services/public/toastr.service';
import { IProfession, IServiceCategory } from '../../../../../core/models/category.model';
import { CategoryService } from '../../../../../core/services/category.service';
import { ServiceManagementService } from '../../../../../core/services/service-management.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../partials/shared/confirm-dialog-box/confirm-dialog.component';
import { LoadingCircleAnimationComponent } from "../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";
import { SharedDataService } from '../../../../../core/services/public/shared-data.service';

@Component({
  selector: 'app-provider-manage-service',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingCircleAnimationComponent
  ],
  templateUrl: './manage-service.component.html',
  styles: [`
    .glass-card {
      background: white;
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }
    .glass-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    .dropdown-container {
      position: relative;
    }
    .dropdown-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      z-index: 50;
      max-height: 200px;
      overflow-y: auto;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class ProviderManageServiceComponent implements OnInit, OnDestroy {
  private readonly _fb = inject(FormBuilder);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _providerService = inject(ServiceManagementService);
  private readonly _categoryService = inject(CategoryService);
  private readonly _dialog = inject(MatDialog);
  private readonly _destroy$ = new Subject<void>();
  private readonly _sharedService = inject(SharedDataService);

  viewMode = signal<'list' | 'form'>('list');
  isEditing = signal(false);
  serviceForm!: FormGroup;
  categorySearchControl = new FormControl('');

  services = signal<IProviderService[]>([]);
  loading = signal(false);
  isCreating = signal(false);

  professions = signal<IProfession[]>([]);
  serviceCategories = signal<IServiceCategory[]>([]);

  showCategoryDropdown = signal(false);
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  stats = signal({
    total: 0,
    active: 0,
    inactive: 0
  });

  constructor() {
    effect(() => {
      if (this.viewMode() === 'form') {
        this._loadProfessions();
      }
    });
  }

  ngOnInit(): void {
    this._sharedService.setProviderHeader('Service Management');
    this._loadServices();
    this._initForm();

    this.serviceForm.get('professionId')?.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(profId => {
        this._loadCategoriesByProf(profId);
      });
  }

  get displayedCategories() {
    const searchText = (this.categorySearchControl.value || '').toLowerCase();
    const cats = this.serviceCategories();
    if (!searchText) return cats;
    return cats.filter(c => c.name.toLowerCase().includes(searchText));
  }

  selectCategory(cat: IServiceCategory) {
    this.serviceForm.patchValue({
      categoryId: cat.id,
      categoryName: cat.name
    });
    this.showCategoryDropdown.set(false);
    this.categorySearchControl.setValue('');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  toggleView(mode: 'list' | 'form', service?: IProviderService) {
    this.viewMode.set(mode);
    this.isEditing.set(!!service);
    this.categorySearchControl.setValue('');
    this.selectedFile = null;
    this.imagePreview = service?.image || null;

    if (service) {
      this.serviceForm.patchValue({
        id: service.id,
        professionId: service.profession.id,
        categoryId: service.category.id,
        categoryName: service.category.name,
        description: service.description,
        price: service.price,
        pricingUnit: service.pricingUnit,
        estimatedTimeInMinutes: service.estimatedTimeInMinutes,
        isActive: service.isActive
      });
    } else {
      this.serviceForm.reset({ pricingUnit: 'hour', isActive: true, professionId: '', categoryId: '', categoryName: '' });
    }
  }

  deleteService(id: string) {
    this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Service',
        message: 'Are you sure you want to delete this service?',
      }
    })
      .afterClosed()
      .subscribe(confirm => {
        if (!confirm) return;
        this._providerService.deleteService(id)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: () => {
              this.services.update(prev => prev.filter(s => s.id !== id));
              this._updateStats();
              this._toastr.success('Service deleted successfully');
            }
          });
      });
  }

  toggleStatus(service: IProviderService, event: Event) {
    const ele = event.target as HTMLInputElement;
    ele.checked = service.isActive;

    this._providerService.toggleServiceStatus(service.id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          service.isActive = !service.isActive;
          this._updateStats();
          this._toastr.info(`Service ${service.isActive ? 'activated' : 'deactivated'}`);
        }
      });
  }

  onSubmit() {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const val = this.serviceForm.value;
    const formData = new FormData();
    Object.keys(val).forEach(key => {
      if (key !== 'categoryName' && val[key] !== null && val[key] !== undefined) {
        formData.append(
          key,
          typeof val[key] === 'object' ? JSON.stringify(val[key]) : val[key]
        );
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.isCreating.set(true);
    const action$ = this.isEditing()
      ? this._providerService.updateService(val.id, formData)
      : this._providerService.createService(formData);


    action$.pipe(
      takeUntil(this._destroy$),
      finalize(() => this.isCreating.set(false))
    ).subscribe({
      next: (res) => {
        this._toastr.success(this.isEditing() ? 'Service updated' : 'Service created');
        this._loadServices();
        this.viewMode.set('list');
      }
    });
  }

  private _loadServices() {
    this.loading.set(true);
    this._providerService.getServices()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.services.set(res.data);
            this._updateStats();
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  private _updateStats() {
    const s = this.services();
    const active = s.filter(x => x.isActive).length;
    this.stats.set({
      total: s.length,
      active: active,
      inactive: s.length - active
    });
  }

  private _initForm() {
    this.serviceForm = this._fb.group({
      id: [null],
      professionId: ['', Validators.required],
      categoryId: ['', Validators.required],
      categoryName: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      price: [null, [Validators.required, Validators.min(0)]],
      pricingUnit: ['hour', Validators.required],
      estimatedTimeInMinutes: [null, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  private _loadProfessions() {
    this._categoryService.getProfessions()
      .pipe(takeUntil(this._destroy$))
      .subscribe(res => {
        if (res.data) this.professions.set(res.data);
      });
  }

  private _loadCategoriesByProf(profId: string) {
    if (!profId) {
      this.serviceCategories.set([]);
      this.professions.set([]);
      return;
    }

    this._categoryService.getServiceCategories({ profession: profId }, 1, 100)
      .pipe(takeUntil(this._destroy$))
      .subscribe(res => {
        if (res.data) {
          this.serviceCategories.set(res.data.services);
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
