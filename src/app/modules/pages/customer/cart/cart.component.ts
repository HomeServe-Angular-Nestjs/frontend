import { Component, computed, effect, inject, OnDestroy, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { map, Subject, takeUntil } from 'rxjs';
import { SelectedServiceType } from '../../../../core/models/cart.model';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';
import { CartService } from '../../../../core/services/cart.service';
import { BookingService } from '../../../../core/services/booking.service';
import { IPriceBreakupData } from '../../../../core/models/booking.model';

@Component({
    selector: 'app-customer-cart',
    standalone: true,
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
    imports: [
        CommonModule,
    ],
})
export class CartComponent implements OnInit, OnDestroy {
    private readonly _sharedDataService = inject(SharedDataService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _bookingService = inject(BookingService);
    public readonly _cartService = inject(CartService);
    private readonly _router = inject(Router);

    private destroy$ = new Subject<void>();

    // Derived signals from CartService
    cartItemCount = computed(() => this._cartService.cart()?.items.length || 0);
    cartItems = computed(() => this._cartService.cart()?.items || []);
    priceBreakup = signal<IPriceBreakupData>({
        subTotal: 0.00,
        tax: 0.00,
        total: 0.00,
    });

    // Grouped list for UI
    purchasedServiceList = computed(() => {
        const items = this.cartItems();
        const categoryMap = new Map<string, SelectedServiceType>();

        items.forEach(service => {
            if (!categoryMap.has(service.category.id)) {
                categoryMap.set(service.category.id, {
                    id: service.category.id,
                    name: service.category.name,
                    services: [service]
                });
            } else {
                categoryMap.get(service.category.id)?.services.push(service);
            }
        });

        return Array.from(categoryMap.values());
    });

    providerId = computed(() => this.cartItems().length > 0 ? this.cartItems()[0].providerId : null);

    ngOnInit() {
        this._fetchCart();
        this._fetchPriceBreakup();
    }

    private _fetchPriceBreakup() {
        this._bookingService.fetchPriceBreakup()
            .pipe(
                takeUntil(this.destroy$),
                map((res) => res.data ?? this.priceBreakup())
            )
            .subscribe({
                next: (priceBreakup) => this.priceBreakup.set(priceBreakup),
                error: (err) => this._toastr.error(err),
            });
    }

    private _fetchCart() {
        this._cartService.getCart()
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    removeFromList(serviceId: string): void {
        this._cartService.removeItemsFromCart(serviceId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this._toastr.success('Item removed from cart');
                    }
                },
                error: (err) => this._toastr.error(err.message || 'Failed to remove item')
            });
    }

    clearCart() {
        this._cartService.clearCart()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this._toastr.success('Cart cleared');
                    }
                },
                error: (err) => this._toastr.error(err.message || 'Failed to clear cart')
            });
    }

    scheduleTime() {
        const selectedData = this.purchasedServiceList();
        const pId = this.providerId();
        if (selectedData.length <= 0) return;
        this._sharedDataService.setSelectedServiceData(selectedData);
        this._router.navigate(['schedule_service', pId]);
    }

    isScrolled = signal(false);

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled.set(window.scrollY > 20);
    }

    goBack() {
        const pId = this.providerId();
        if (pId) {
            this._router.navigate(['provider_details', pId, 'services']);
        } else {
            this._router.navigate(['homepage']);
        }
    }
}
