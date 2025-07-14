import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { ScheduleService } from '../../../../../../core/services/schedule.service';
import { map, Observable } from 'rxjs';
import { IScheduleList } from '../../../../../../core/models/schedules.model';
import { ProviderScheduleListDetailsComponent } from "../schedule-list-details/schedule-list-details.component";
import { FormsModule } from '@angular/forms';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../partials/shared/confirm-dialog-box/confirm-dialog.component';
import { IPagination } from '../../../../../../core/models/booking.model';
import { ProviderPaginationComponent } from "../../../../partials/sections/provider/pagination/provider-pagination.component";

@Component({
  selector: 'app-provider-schedule-view',
  standalone: true,
  imports: [CommonModule, ProviderScheduleListDetailsComponent, FormsModule, RouterLink, ProviderPaginationComponent],
  templateUrl: './provider-schedule-view.component.html',
})
export class ProviderScheduleViewComponent implements OnInit {
  private readonly _scheduleService = inject(ScheduleService);
  private readonly _toastr = inject(ToastNotificationService);
  private _dialog = inject(MatDialog);

  scheduleList$!: Observable<IScheduleList[]>
  isDrawerOpen: boolean = false;
  selectedSchedule!: string;
  selectedScheduleId!: string;

  pagination!: IPagination;

  ngOnInit(): void {
    this._loadSchedules();
  }

  openDrawer(id: string, month: string) {
    this.selectedSchedule = month;
    this.selectedScheduleId = id;
    this.isDrawerOpen = true;
  }

  closeDrawer() {
    this.isDrawerOpen = false
  }

  formatMonthYear(monthString: string): Date {
    return new Date(`${monthString}-01`);
  }

  toggleStatus(scheduleId: string, status: boolean) {
    this._scheduleService.toggleScheduleStatus({
      scheduleId,
      status: !status
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this._loadSchedules();
          this._toastr.success(response.message);
        }
      },
    })
  }

  removeSchedule(scheduleId: string) {
    this._openConfirmationDialog(
      'Deleting this item may result in temporary data loss. Proceed with caution.',
      'Are you sure you want to continue?'
    ).afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this._scheduleService.removeSchedule(scheduleId).subscribe({
          next: (response) => {
            if (response.success) {
              this._toastr.success(response.message);
              this._loadSchedules();
            }
          }
        })
      });
  }


  changePage(page: number) {
    this._loadSchedules(page);
  }

  private _loadSchedules(page: number = 1) {
    this.scheduleList$ = this._scheduleService.fetchSchduleList(page).pipe(
      map((response) => {
        this.pagination = response.data?.pagination as IPagination;
        return response.data?.scheduleList ?? []
      })
    );
  }

  private _openConfirmationDialog(message: string, title: string) {
    return this._dialog.open(ConfirmDialogComponent, {
      data: { title, message },
    });
  }
}

