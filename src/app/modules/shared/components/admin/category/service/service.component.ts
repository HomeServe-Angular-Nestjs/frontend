import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../../../../core/services/category.service';
import { IProfession, IServiceCategory, IServiceCategoryFilter } from '../../../../../../core/models/category.model';
import { IPagination } from '../../../../../../core/models/booking.model';
import { catchError, EMPTY, Subject, switchMap, takeUntil } from 'rxjs';
import { AdminPaginationComponent } from '../../../../partials/sections/admin/pagination/pagination.component';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { AdminSimpleTableComponent, TableColumn } from '../../../../partials/sections/admin/table/reusable-table.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../partials/shared/confirm-dialog-box/confirm-dialog.component';

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
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _dialog = inject(MatDialog);
  private readonly _destroy$ = new Subject<void>();
  private readonly _fetchTrigger$ = new Subject<{ filter: IServiceCategoryFilter; page: number; limit: number }>();

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
    this._setupFetchTrigger();

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
    this.pagination.update(p => ({ ...p, page: 1 }));
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
    const trimmedName = name.trim();
    const isDuplicate = this.services().some(s =>
      s.professionId === professionId &&
      s.name.toLowerCase().trim() === trimmedName.toLowerCase() &&
      s.id !== this.currentServiceId()
    );

    if (isDuplicate) {
      this.serviceForm.get('name')?.setErrors({ duplicate: true });
      return;
    }

    const serviceData: Partial<IServiceCategory> = {
      name: trimmedName,
      professionId,
      isActive,
      keywords: this.keywords()
    };

    if (this.isEditMode() && this.currentServiceId()) {
      this._openConfirmation('Are you sure you want to update this service?', 'Confirm Update')
        .afterClosed()
        .subscribe(confirmed => {
          if (!confirmed) return;

          this._categoryService.updateServiceCategory(this.currentServiceId()!, serviceData)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
              next: (res) => {
                this._fetchServices(this.pagination().page);
                this.closeModal();
                this._toastr.success('Service updated successfully');
              }
            });
        });
    } else {
      this._categoryService.createServiceCategory(serviceData)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            this._fetchServices(1);
            this.closeModal();
            this._toastr.success('Service created successfully');
          }
        });
    }
  }

  toggleStatus(service: IServiceCategory) {
    const message = service.isActive
      ? `Deactivate "${service.name}"? Provider services linked to it will be disabled and hidden from customers.`
      : `Activate "${service.name}"?`;

    this._openConfirmation(message, service.isActive ? 'Confirm Deactivation' : 'Confirm Activation')
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;

        this._categoryService.updateServiceCategoryStatus(service.id)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: () => {
              this.services.update(current =>
                current.map(s => s.id === service.id ? { ...s, isActive: !s.isActive } : s)
              );
              this._toastr.success('Status updated successfully');
            }
          });
      });
  }

  private _openConfirmation(message: string, title: string) {
    return this._dialog.open(ConfirmDialogComponent, { data: { title, message } });
  }

  getProfessionName(professionId: string): string {
    const profession = this.professions().find(p => p.id === professionId);
    return profession ? profession.name : 'Unknown';
  }

  isParentProfessionInactive(professionId: string): boolean {
    const profession = this.professions().find(p => p.id === professionId);
    return !!profession && profession.isActive === false;
  }

  private _fetchServices(page: number = 1) {
    const filter: IServiceCategoryFilter = {
      search: this.searchTerm(),
      profession: this.selectedProfession(),
      isActive: this.selectedStatus(),
    };

    this._fetchTrigger$.next({ filter, page, limit: this.pagination().limit });
  }

  private _setupFetchTrigger() {
    this._fetchTrigger$
      .pipe(
        switchMap(({ filter, page, limit }) =>
          this._categoryService.getServiceCategories(filter, page, limit).pipe(catchError(() => EMPTY))
        ),
        takeUntil(this._destroy$)
      )
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.pagination.set(res.data.pagination);
          }
        }
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
        this.pagination.update(p => ({ ...p, page: 1 }));
        this._fetchServices(1);
      });
  }


  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
