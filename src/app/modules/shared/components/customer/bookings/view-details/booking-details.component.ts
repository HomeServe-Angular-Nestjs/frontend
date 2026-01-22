import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { filter, map, Observable, Subject, switchMap, takeUntil } from "rxjs";
import { BookingService } from "../../../../../../core/services/booking.service";
import { formatFullDateWithTimeHelper } from "../../../../../../core/utils/date.util";
import { IBookingDetailCustomer } from "../../../../../../core/models/booking.model";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { BookingStatus } from "../../../../../../core/enums/enums";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";
import { chatActions } from "../../../../../../store/chat/chat.action";
import { ChatSocketService } from "../../../../../../core/services/socket-service/chat.service";
import { Store } from "@ngrx/store";

@Component({
    selector: 'app-customer-view-booking-details',
    templateUrl: './booking-details.component.html',
    imports: [CommonModule, ButtonComponent, LoadingCircleAnimationComponent, RouterLink]
})
export class CustomerViewBookingDetailsComponent implements OnInit {
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _bookingService = inject(BookingService);
    private readonly _chatService = inject(ChatSocketService);
    private readonly _route = inject(ActivatedRoute);
    private readonly _router = inject(Router);
    private readonly _store = inject(Store);

    private _destroy$ = new Subject<void>();
    bookingDetails$!: Observable<IBookingDetailCustomer>;

    ngOnInit(): void {
        this.bookingDetails$ = this._route.paramMap.pipe(
            takeUntil(this._destroy$),
            map(param => param.get('id')),
            filter((id): id is string => !!id),
            switchMap(id => this._bookingService.fetchBookingDetails(id)),
            map(res => res.data!)
        )
    }

    formatDate(date: string): string {
        return formatFullDateWithTimeHelper(date);
    }

    downloadInvoice(bookingId: string, bookingStatus: BookingStatus) {
        if (bookingStatus !== BookingStatus.COMPLETED) {
            this._toastr.error('You can only download invoice for completed bookings.');
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
            })
    }

    chat(providerId: string) {
        this._chatService.fetchChat({ id: providerId, type: 'provider' })
            .subscribe({
                next: (response) => {
                    if (response.success && response.data?.id) {
                        this._store.dispatch(chatActions.selectChat({ chatId: response.data.id }));
                        this._router.navigate(['chat']);
                    } else {
                        this._toastr.error('Unable to fetch chat.');
                    }
                },
                error: (err) => {
                    this._toastr.error('An error occurred while fetching chat.');
                    console.error('Chat error:', err);
                }
            });
    }
}