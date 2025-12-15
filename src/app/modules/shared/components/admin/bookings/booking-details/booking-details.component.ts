import { Component, inject, OnInit } from '@angular/core';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';
import { AdminService } from '../../../../../../core/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IAdminBookingDetails } from '../../../../../../core/models/booking.model';
import { CommonModule } from '@angular/common';
import { TransactionType } from '../../../../../../core/enums/enums';

@Component({
  selector: 'app-admin-booking-details',
  imports: [CommonModule],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.scss'
})
export class AdminBookingDetailsComponent implements OnInit {
  private readonly _sharedDataService = inject(SharedDataService);
  private readonly _adminService = inject(AdminService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  bookingDetails: IAdminBookingDetails | null = null;

  ngOnInit(): void {
    this._sharedDataService.setAdminHeader("Booking Details");
    this._activatedRoute.paramMap.subscribe({
      next: (params) => {
        const bookingId = params.get('bookingId');
        if (bookingId) {
          this._getBookingDetails(bookingId);
        } else {
          this._router.navigate(['/not_found']);
        }
      }
    });
  }

  private _getBookingDetails(bookingId: string) {
    this._adminService.fetchBookingDetails(bookingId).subscribe({
      next: (res) => {
        this.bookingDetails = res?.data || null;
      }
    });
  }

  displayType(type: TransactionType) {
    switch (type) {
      case TransactionType.BOOKING_PAYMENT:
        return 'Booking Payment';
      case TransactionType.BOOKING_REFUND:
        return 'Booking Refund';
      case TransactionType.BOOKING_RELEASE:
        return 'Booking Release';
      case TransactionType.CANCELLATION_FEE:
        return 'Cancellation Fee';
      case TransactionType.GST:
        return 'GST';
      case TransactionType.PROVIDER_COMMISSION:
        return 'Provider Commission';
      default:
        return '-';
    }
  }
}
