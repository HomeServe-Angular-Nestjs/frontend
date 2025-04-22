import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { IProvider } from "../models/user.model";
import { API_ENV } from "../../environments/api.environments";

@Injectable({ providedIn: 'root' })
export class ProviderService {
    private http = inject(HttpClient);

    private readonly apiUrl = API_ENV.provider;

    getProviders(): Observable<IProvider[]> {
        return this.http.get<IProvider[]>(`${this.apiUrl}/fetch_providers`);
    }

    getOneProvider(): Observable<IProvider> {
        return this.http.get<IProvider>(`${this.apiUrl}/fetch_one_provider`);
    }

    updateProviderData(formData: FormData | Partial<IProvider>): Observable<IProvider> {
        return this.http.patch<IProvider>(`${this.apiUrl}/update_providers`, formData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        )
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}
