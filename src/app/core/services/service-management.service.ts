import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { catchError, Observable, throwError } from "rxjs";
import { NotificationService } from "./public/notification.service";
import { IOfferedService, ISubService } from "../models/offeredService.model";

@Injectable({ providedIn: 'root' })
export class OfferedServicesService {
    private http = inject(HttpClient);
    private notyf = inject(NotificationService);

    private apiUrl = API_ENV.provider;

    uploadImage(formData: FormData): Observable<{ imageUrl: string }> {
        return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/uploadImage`, formData).pipe(
            catchError(() => {
                const errorMessage = 'Error While uploading image';
                this.notyf.error(errorMessage)
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    sendFormData(formData: FormData) {
        return this.http.post(`${this.apiUrl}/create_service`, formData).pipe(
            catchError(() => {
                const errorMessage = 'Error While submitting service form';
                this.notyf.error(errorMessage)
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    fetchOfferedServices(): Observable<IOfferedService[]> {
        return this.http.get<IOfferedService[]>(`${this.apiUrl}/offered_services`);
    }

    fetchOneService(id: string): Observable<IOfferedService> {
        return this.http.get<IOfferedService>(`${this.apiUrl}/offered_service?id=${id}`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        )
    }

    updateService(updateData: Partial<IOfferedService>): Observable<IOfferedService> {
        return this.http.patch<IOfferedService>(`${this.apiUrl}/offered_services`, updateData);
    }

    updateSubService(updateData: Partial<ISubService>): Observable<{ id: string, subService: ISubService }> {
        return this.http.patch<{ id: string, subService: ISubService }>(`${this.apiUrl}/subservice`, updateData);
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}