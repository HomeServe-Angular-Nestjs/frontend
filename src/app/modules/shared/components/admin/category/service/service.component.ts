import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../../../../core/services/category.service';
import { IProfession, IServiceCategory, IServiceCategoryFilter } from '../../../../../../core/models/category.model';
import { IPagination } from '../../../../../../core/models/booking.model';
import { Subject, takeUntil } from 'rxjs';
import { AdminPaginationComponent } from '../../../../partials/sections/admin/pagination/pagination.component';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { ConfirmDialogComponent } from '../../../../partials/shared/confirm-dialog-box/confirm-dialog.component';
import { AdminSimpleTableComponent, TableColumn } from '../../../../partials/sections/admin/table/reusable-table.component';

@Component({
  selector: 'app-admin-category-service',
  templateUrl: './service.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AdminPaginationComponent, AdminSimpleTableComponent],
  providers: [DebounceService],
})
export class AdminCategoryServiceComponent implements OnInit, OnDestroy {
  private readonly _debounceService = inject(DebounceService);
  private readonly _categoryService = inject(CategoryService);
  private readonly _fb = inject(FormBuilder);
  private readonly _dialog = inject(MatDialog);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _destroy$ = new Subject<void>();

  // Data Signals
  services = signal<IServiceCategory[]>([]);
  professions = signal<IProfession[]>([]);
  pagination = signal<IPagination>({
    page: 1,
    limit: 10,
    total: 0
  });

  // Filters Signals
  searchTerm = signal('');
  selectedProfession = signal('');
  selectedStatus = signal('all');

  // Modal & Edit State Signals
  showModal = signal(false);
  isEditMode = signal(false);
  currentServiceId = signal<string | undefined>(undefined);
  keywords = signal<string[]>([]);

  serviceForm!: FormGroup;

  tableColumns: TableColumn[] = [
    { label: 'Service Name', key: 'name', type: 'text' },
    { label: 'Profession', key: 'professionId', type: 'template' },
    { label: 'Keywords', key: 'keywords', type: 'tags' },
    { label: 'Status', key: 'isActive', type: 'status' },
    { label: 'Actions', key: 'actions', type: 'template' }
  ];

  constructor() {
    this._initForm();
    this._setupSearchDebounce();

    // Subscribe to updates
    this._categoryService.professions$
      .pipe(takeUntil(this._destroy$))
      .subscribe(profs => {
        this.professions.set(profs);
      });

    this._categoryService.services$
      .pipe(takeUntil(this._destroy$))
      .subscribe(service => {
        this.services.set(service);
      });
  }

  ngOnInit(): void {
    this._fetchServices();
  }

  // Actions
  onSearch(term: string) {
    this._debounceService.delay(term);
  }

  onFilterChange() {
    this._fetchServices(1);
  }

  onPageChange(page: number) {
    this._fetchServices(page);
  }

  // Modal Actions
  openModal(service?: IServiceCategory) {
    this.isEditMode.set(!!service);
    this.currentServiceId.set(service?.id);
    this.showModal.set(true);
    this.keywords.set(service ? [...service.keywords] : []);

    if (service) {
      this.serviceForm.patchValue({
        name: service.name,
        professionId: service.professionId,
        isActive: service.isActive
      });
    } else {
      this.serviceForm.reset({
        name: '',
        professionId: '',
        isActive: true
      });
      this.keywords.set([]);
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.serviceForm.reset();
    this.keywords.set([]);
  }

  // Keyword Management
  addKeywords(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value) {
      const newKeywords = value.split(',').map(k => k.trim()).filter(k => k);
      // Updates signal array immutably
      this.keywords.update(current => {
        const unique = new Set([...current, ...newKeywords]);
        return Array.from(unique);
      });
      input.value = '';
    }
  }

  removeKeyword(index: number) {
    this.keywords.update(current => {
      const updated = [...current];
      updated.splice(index, 1);
      return updated;
    });
  }

  // Save Service
  onSubmit() {
    if (this.serviceForm.invalid) return;

    const { name, professionId, isActive } = this.serviceForm.value;
    const isDuplicate = this.services().some(s =>
      s.professionId === professionId &&
      s.name.toLowerCase().trim() === name.toLowerCase().trim() &&
      s.id !== this.currentServiceId()
    );

    if (isDuplicate) {
      this.serviceForm.get('name')?.setErrors({ duplicate: true });
      return;
    }

    const serviceData: Partial<IServiceCategory> = {
      name,
      professionId,
      isActive,
      keywords: this.keywords()
    };

    if (this.isEditMode() && this.currentServiceId()) {
      this._categoryService.updateServiceCategory(this.currentServiceId()!, serviceData)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            this._fetchServices(this.pagination().page);
            this.closeModal();
            this._toastr.success('Service updated successfully');
          },
          error: (error) => this._toastr.error(error.message || 'Failed to update service')
        });
    } else {
      this._categoryService.createServiceCategory(serviceData)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            this._fetchServices(1);
            this.closeModal();
            this._toastr.success('Service created successfully');
          },
          error: (error) => this._toastr.error(error.message || 'Failed to create service')
        });
    }
  }

  toggleStatus(serviceId: string) {
    this._categoryService.updateServiceCategoryStatus(serviceId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.services.update(current =>
            current.map(s => s.id === serviceId ? { ...s, isActive: !s.isActive } : s)
          );
          this._toastr.success('Status updated successfully');
        }
      })
  }

  removeService(service: IServiceCategory) {
    this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Service',
        message: `Are you sure you want to remove ${service.name}?`,
      },
    })
      .afterClosed()
      .subscribe(confirm => {
        if (!confirm) return;
        this._categoryService.removeServiceCategory(service.id)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: (res) => {
              this._fetchServices(this.pagination().page);
              this._toastr.success('Service removed successfully');
            },
            error: (error) => this._toastr.error('Failed to remove service')
          });
      });
  }

  getProfessionName(professionId: string): string {
    const profession = this.professions().find(p => p.id === professionId);
    return profession ? profession.name : 'Unknown';
  }

  private _fetchServices(page: number = 1) {
    const filter: IServiceCategoryFilter = {
      search: this.searchTerm(),
      profession: this.selectedProfession(),
      isActive: this.selectedStatus(),
    };

    // Use the passed page number for the request
    this._categoryService.getServiceCategories(filter, page, this.pagination().limit)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.pagination.set(res.data.pagination);
          }
        },
        error: (err) => console.error(err)
      });
  }

  private _initForm() {
    this.serviceForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      professionId: ['', [Validators.required]],
      keywords: [''],
      isActive: [true]
    });
  }

  private _setupSearchDebounce() {
    this._debounceService.onSearch(500)
      .pipe(takeUntil(this._destroy$))
      .subscribe(term => {
        this.searchTerm.set(term);
        this._fetchServices(1);
      });
  }


  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
