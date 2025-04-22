import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { catchError, Observable, throwError } from "rxjs";
import { NotificationService } from "./public/notification.service";
import { IOfferedService } from "../models/offeredService.model";

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

    updateService(updateData: Partial<IOfferedService>): Observable<IOfferedService> {
        return this.http.patch<IOfferedService>(`${this.apiUrl}/offered_services`, updateData);
    }
}