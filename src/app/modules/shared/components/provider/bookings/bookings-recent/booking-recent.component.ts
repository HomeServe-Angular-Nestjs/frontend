import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BehaviorSubject, Observable, Subject, takeUntil } from "rxjs";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ProviderPaginationComponent } from "../../../../partials/sections/provider/pagenation/provider-pagination.component";
import { BookingService } from "../../../../../../core/services/booking.service";
import { IBookingFilter, IResponseProviderBookingLists } from "../../../../../../core/models/booking.model";
import { formatFullDateWithTimeHelper } from "../../../../../../core/utils/date.util";
import { DebounceService } from "../../../../../../core/services/public/debounce.service";
import { RouterLink } from "@angular/router";
import { ChatService } from "../../../../../../core/services/chat.service";

@Component({
    selector: 'app-provider-booking-recent',
    templateUrl: './booking-recent.component.html',
    imports: [CommonModule, ProviderPaginationComponent, FormsModule, RouterLink],
    providers: [DebounceService]
})
export class ProviderBookingRecentComponent implements OnInit, OnChanges, OnDestroy {
    private readonly _bookingService = inject(BookingService);
    private readonly _debounceService = inject(DebounceService);
    private readonly _sanitizer = inject(DomSanitizer);
    private readonly _chatService = inject(ChatService);

    @Input() filters: IBookingFilter = {};

    private _destroy$ = new Subject<void>();
    private _filters$ = new BehaviorSubject<IBookingFilter>({});

    bookingResponseData$!: Observable<IResponseProviderBookingLists>;
    searchTerm: string = '';

    ngOnInit(): void {
        this._filters$.next({ ...this.filters, search: this.searchTerm });

        this._filters$
            .pipe(takeUntil(this._destroy$))
            .subscribe((filter) => {
                this.loadBookings(1, filter);
            })

        this._debounceService.onSearch(700)
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                this._emitFilters();
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['filters'] && changes['filters'].currentValue) {
            this._emitFilters();
        }
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    loadBookings(page: number, filter: IBookingFilter = {}) {
        this.bookingResponseData$ = this._bookingService.getBookingList(page, filter);
    }

    sanitizeImageUrl(imageUrl: string): SafeUrl {
        const safeUrl = this._sanitizer.bypassSecurityTrustUrl(imageUrl);
        return safeUrl;
    }

    onImageError(event: Event) {
        const imgElement = event.target as HTMLImageElement;
        imgElement.src = 'assets/images/profile_placeholder.jpg';
    }

    getDate(date: string): string {
        const formatted = formatFullDateWithTimeHelper(date);
        const parts = formatted.split(',');
        return parts.slice(0, 2).join(',').trim();
    }

    getTime(date: string): string {
        const formatted = formatFullDateWithTimeHelper(date);
        const parts = formatted.split(',');
        return parts[2]?.trim() || '';
    }

    onSearchTriggered() {
        this._debounceService.delay(this.searchTerm);
    }

    goToChat(customerId: string) {
        this._chatService.createChat(customerId).subscribe(data => console.log(data));
    }

    private _emitFilters(): void {
        const filter: IBookingFilter = {
            search: this.searchTerm,
            ...this.filters
        };

        this._filters$.next(filter);
    }
}