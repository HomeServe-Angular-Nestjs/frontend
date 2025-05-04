import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, throwError } from "rxjs";
import { IProvider } from "../models/user.model";
import { API_ENV } from "../../environments/api.environments";
import { SlotType } from "../models/schedules.model";

@Injectable({ providedIn: 'root' })
export class ProviderService {
    private _http = inject(HttpClient);

    private providerDataSource = new BehaviorSubject<IProvider | null>(null);
    private readonly apiUrl = API_ENV.provider;

    providerData$ = this.providerDataSource.asObservable();

    getProviders(): Observable<IProvider[]> {
        return this._http.get<IProvider[]>(`${this.apiUrl}/fetch_providers`);
    }

    getOneProvider(id: string | null = null): Observable<IProvider> {
        return this._http.get<IProvider>(`${this.apiUrl}/fetch_one_provider?id=${id}`);
    }

    updateProviderData(formData: FormData | Partial<IProvider>): Observable<IProvider> {
        return this._http.patch<IProvider>(`${this.apiUrl}/update_provider`, formData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    updateDefaultSlot(slot: SlotType) {
        return this._http.patch(`${this.apiUrl}/default_slots`, slot).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    deleteDefaultSlot() {
        return this._http.delete(`${this.apiUrl}/default_slots`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    setProviderData(data: IProvider) {
        this.providerDataSource.next(data);
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}
