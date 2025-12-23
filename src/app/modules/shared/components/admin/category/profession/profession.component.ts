import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { IProfession, IProfessionFilter } from '../../../../../../core/models/category.model';
import { CategoryService } from '../../../../../../core/services/category.service';
import { map, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { IPagination } from '../../../../../../core/models/booking.model';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../partials/shared/confirm-dialog-box/confirm-dialog.component';

@Component({
  selector: 'app-admin-category-profession',
  templateUrl: './profession.component.html',
  imports: [CommonModule, FormsModule],
  providers: [DebounceService]
})
export class AdminCategoryProfessionComponent implements OnInit, OnDestroy {
  private readonly _categoryService = inject(CategoryService);
  private readonly _debounceService = inject(DebounceService);
  private readonly _destroy$ = new Subject<void>();
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _dialog = inject(MatDialog);

  private readonly _newProfession: IProfession = {
    id: '',
    name: '',
    isActive: true,
  }

  isModalOpen = signal<boolean>(false);
  professions = signal<IProfession[]>([]);
  editableProfession = signal<IProfession>({ ...this._newProfession });

  searchQuery = signal<string>('');
  statusFilter = signal<string>('all');

  ngOnInit(): void {
    this._loadProfessions();

    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe(query => {
        this.searchQuery.set(query);
        this._loadProfessions();
      });
  }

  onSearch(query: string) {
    this._debounceService.delay(query);
  }

  onStatusChange(status: string) {
    this.statusFilter.set(status);
    this._loadProfessions();
  }

  openModal(profession: IProfession | null = null) {
    if (profession) {
      this.editableProfession.set({ ...profession });
    } else {
      this.editableProfession.set({ ...this._newProfession });
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editableProfession.set({ ...this._newProfession });
  }

  saveProfession() {
    const profession = this.editableProfession();

    // Validation
    if (!profession.name || profession.name.trim().length < 3) {
      this._toastr.error('Profession name must be at least 3 characters long.');
      return;
    }

    const payload = {
      name: profession.name.trim(),
      isActive: profession.isActive
    };

    if (profession.id) {
      // Update
      this._categoryService.updateProfession(payload, profession.id)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this._loadProfessions();
              this.closeModal();
              this._toastr.success(res.message);
            } else {
              this._toastr.error(res.message);
            }
          },
        });
    } else {
      // Create
      this._categoryService.createProfession(payload)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this._loadProfessions();
              this.closeModal();
              this._toastr.success(res.message);
            } else {
              this._toastr.error(res.message);
            }
          },
        });
    }
  }

  editProfession(profession: IProfession) {
    this.openModal(profession);
  }

  removeProfession(profession: IProfession) {
    this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Profession',
        message: `Are you sure you want to remove ${profession.name}?`,
      },
    })
      .afterClosed()
      .subscribe(confirm => {
        if (!confirm) return;
        this._categoryService.removeProfession(profession.id)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: (res) => {
              if (res.success) {
                this._loadProfessions();
                this._toastr.success(res.message);
              }
            }
          });
      });
  }

  toggleStatus(professionId: string) {
    this._categoryService.updateProfessionStatus(professionId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this._loadProfessions();
          }
        }
      });
  }

  private _loadProfessions() {
    const filter: IProfessionFilter = {
      isActive: this.statusFilter(),
      search: this.searchQuery(),
    };

    this._categoryService.getProfessions(filter)
      .pipe(
        takeUntil(this._destroy$),
        map(res => res.data || [])
      )
      .subscribe({
        next: (professions) => {
          this.professions.set(professions);
        },
        error: (err) => console.log(err)
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
