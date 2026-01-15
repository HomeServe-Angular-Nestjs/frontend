import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal, computed } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { ICartUI } from "../models/cart.model";
import { IResponse } from "../../modules/shared/models/response.model";
import { Observable, tap } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CartService {
    private readonly _http = inject(HttpClient);
    private readonly _apiUrl = API_ENV.cart;

    private _cart = signal<ICartUI | null>(null);
    public readonly cart = this._cart.asReadonly();
    public readonly cartItemCount = computed(() => this._cart()?.items.length || 0);

    getCart(): Observable<IResponse<ICartUI>> {
        return this._http.get<IResponse<ICartUI>>(`${this._apiUrl}`).pipe(
            tap(res => {
                if (res.success && res.data) {
                    this._cart.set(res.data);
                }
            })
        );
    }

    addItemsToCart(providerId: string, providerServiceId: string): Observable<IResponse<ICartUI>> {
        return this._http.patch<IResponse<ICartUI>>(`${this._apiUrl}/add`, { providerServiceId, providerId }).pipe(
            tap(res => {
                if (res.success && res.data) {
                    this._cart.set(res.data);
                }
            })
        );
    }

    removeItemsFromCart(providerServiceId: string): Observable<IResponse<ICartUI>> {
        return this._http.patch<IResponse<ICartUI>>(`${this._apiUrl}/remove`, { providerServiceId }).pipe(
            tap(res => {
                if (res.success && res.data) {
                    this._cart.set(res.data);
                }
            })
        );
    }

    clearCart(): Observable<IResponse> {
        return this._http.patch<IResponse>(`${this._apiUrl}/clear`, {}).pipe(
            tap(res => {
                if (res.success) {
                    this._cart.set(null);
                }
            })
        );
    }
}