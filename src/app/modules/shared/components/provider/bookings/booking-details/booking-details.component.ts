import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { BehaviorSubject, Observable, Subject, filter, finalize, map, of, pipe, switchMap, takeUntil } from "rxjs";

import { IBookingDetailProvider } from "../../../../../../core/models/booking.model";
import { BookingService } from "../../../../../../core/services/booking.service";
import { formatFullDateWithTimeHelper } from "../../../../../../core/utils/date.util";
import { BookingStatus, CancelStatus, PaymentStatus } from "../../../../../../core/enums/enums";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { ReportModalComponent } from "../../../../partials/shared/report-modal/report-modal.component";
import { IReportSubmit, ReportService } from "../../../../../../core/services/report.service";
import { SharedDataService } from "../../../../../../core/services/public/shared-data.service";
import { SubmitCancellationComponent } from "../../../../partials/shared/submit-cancellation/submit-cancellation.component";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../../../partials/shared/confirm-dialog-box/confirm-dialog.component";

@Component({
  selector: 'app-provider-view-booking-details',
  templateUrl: './booking-details.component.html',
  imports: [CommonModule, FormsModule, ButtonComponent, ReportModalComponent, SubmitCancellationComponent],
  providers: [ReportService]
})
export class ProviderViewBookingDetailsComponents implements OnInit, OnDestroy {
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _bookingService = inject(BookingService);
  private readonly _sharedData = inject(SharedDataService);
  private readonly _reportService = inject(ReportService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _dialog = inject(MatDialog);

  private _destroy$ = new Subject<void>();
  private bookingDataSource = new BehaviorSubject<IBookingDetailProvider | null>(null);
  bookingData$ = this.bookingDataSource.asObservable();

  paymentSelectOptions: { value: PaymentStatus; label: string; }[] = [
    { value: PaymentStatus.PAID, label: 'Paid' },
    { value: PaymentStatus.UNPAID, label: 'Unpaid' },
    { value: PaymentStatus.REFUNDED, label: 'Refunded' },
    { value: PaymentStatus.FAILED, label: 'Failed' },
  ];

  bookingSelectOption: { value: BookingStatus; label: string; }[] = [
    { value: BookingStatus.PENDING, label: 'Pending' },
    { value: BookingStatus.IN_PROGRESS, label: 'In Progress' },
    { value: BookingStatus.CONFIRMED, label: 'Confirmed' },
    { value: BookingStatus.COMPLETED, label: 'Completed' },
  ];

  private statusMessageMap: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'mark pending',
    [BookingStatus.IN_PROGRESS]: 'mark in progress',
    [BookingStatus.CONFIRMED]: 'confirm',
    [BookingStatus.COMPLETED]: 'complete',
    [BookingStatus.CANCELLED]: 'cancel',
  };

  showReportModal = signal(false);
  showCancelBookingModal = signal(false);
  get cancelled(): BookingStatus { return BookingStatus.CANCELLED };

  ngOnInit(): void {
    this._sharedData.setProviderHeader('Bookings');

    this._route.paramMap.pipe(
      takeUntil(this._destroy$),
      map(param => param.get('id')),
      filter((id): id is string => !!id),
      switchMap(id => this._bookingService.getBookingDetails(id))
    ).subscribe(bookingData => this.bookingDataSource.next(bookingData));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _openConfirmationDialog(message: string, title: string) {
    return this._dialog.open(ConfirmDialogComponent, {
      data: { title, message },
    });
  }



  changeBookingStatus(bookingId: string, cancelStatus: CancelStatus | null, newStatus: BookingStatus, bookingStatus: BookingStatus): void {
    if (newStatus === bookingStatus) return;

    const action = this.statusMessageMap[newStatus];

    this._openConfirmationDialog(
      `Are you sure you want to ${action} this order?`,
      'Confirm Action'
    )
      .afterClosed()
      .pipe(takeUntil(this._destroy$))
      .subscribe(confirmed => {
        if (!confirmed) return;

        this._bookingService.updateBookingStatus(bookingId, newStatus)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                const bookingData = this.bookingDataSource.getValue() as IBookingDetailProvider;
                bookingData.bookingStatus = newStatus;
                this.bookingDataSource.next(bookingData);
                this._toastr.success(response.message);
              } else {
                this._toastr.error('Failed to update status.');
              }
            }
          });
      });
  }

  formateData(date: string): string {
    return formatFullDateWithTimeHelper(date);
  }

  getBookingBadgeClass(status: string): string {
    const base = 'px-3 py-1 rounded-full text-sm font-medium capitalize';
    switch (status) {
      case 'pending':
        return `${base} bg-yellow-100 text-yellow-800`;
      case 'confirmed':
        return `${base} bg-gray-100 text-gray-700`;
      case 'in_progress':
        return `${base} bg-purple-100 text-purple-800`;
      case 'completed':
        return `${base} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${base} bg-red-100 text-red-800`;
      default:
        return `${base} bg-gray-200 text-gray-700`;
    }
  }

  getPaymentBadgeClass(status: string): string {
    const base = 'px-3 py-1 rounded-full text-sm font-medium capitalize';
    switch (status) {
      case 'paid':
        return `${base} bg-green-100 text-green-800`;
      case 'unpaid':
        return `${base} bg-yellow-100 text-yellow-800`;
      case 'refunded':
        return `${base} bg-blue-100 text-blue-800`;
      case 'failed':
        return `${base} bg-red-100 text-red-800`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  }

  isStatusDisabled(optionStatus: BookingStatus, bookingStatus: BookingStatus, cancelStatus: CancelStatus | null): boolean {
    if (cancelStatus) {
      return optionStatus !== BookingStatus.CANCELLED;
    }

    const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
      [BookingStatus.IN_PROGRESS]: [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
        BookingStatus.CONFIRMED
      ],
      [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      [BookingStatus.COMPLETED]: [],
      [BookingStatus.CANCELLED]: [],
    };

    if (optionStatus === bookingStatus) return false;

    const allowed = allowedTransitions[bookingStatus] ?? [];

    return !allowed.includes(optionStatus);
  }

  toggleReportModal() {
    this.showReportModal.update(v => v = !v);
  }

  submitReport(report: Omit<IReportSubmit, 'targetId'>, customerId: string) {
    if (!customerId) {
      console.error('[ERROR] Provider ID is missing.');
      return;
    };

    const reportData = {
      ...report,
      targetId: customerId,
    }

    this._reportService.submit(reportData).pipe(
      takeUntil(this._destroy$),
    ).subscribe({
      next: (res) => {
        if (res.success) this._toastr.success('Report has been submitted.')
      },
      complete: () => this.toggleReportModal()
    });
  }

  toggleCancelBookingModal() {
    this.showCancelBookingModal.update(v => v = !v);
  }

  onCancelButtonClick(bookingId: string, cancelStatus: CancelStatus | null): void {
    if (cancelStatus === null) {
      this.toggleCancelBookingModal();
      return;
    }

    this.handleCancellation(bookingId);
  }

  handleCancellation(bookingId: string, reason?: string): void {
    console.log(bookingId, reason ?? 'nope')
    this._openConfirmationDialog(
      `Are you sure you want to cancel this order?`,
      'Confirm Action'
    )
      .afterClosed()
      .pipe(takeUntil(this._destroy$))
      .subscribe(confirmed => {
        if (!confirmed) return;

        this._bookingService.markBookingCancelledByProvider(bookingId, reason)
          .pipe(
            takeUntil(this._destroy$),
            finalize(() => this.showCancelBookingModal.set(false))
          )
          .subscribe({
            next: (response) => {
              if (response.success && response.data) {
                this.bookingDataSource.next(response.data);
                this._toastr.success(response.message);
              } else {
                this._toastr.error('Failed to cancel service.');
              }
            }
          });
      });
  }

  downloadInvoice(bookingId: string, bookingStatus: BookingStatus) {
    if (bookingStatus !== BookingStatus.COMPLETED) {
      this._toastr.error('Booking must be completed to download invoice.');
      return;
    }

    this._bookingService.downloadInvoice(bookingId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'booking-invoice.pdf';
          a.click();
          URL.revokeObjectURL(url);
        }
      });
  }
}
