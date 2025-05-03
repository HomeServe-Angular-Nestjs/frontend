import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { catchError, Observable, pipe, throwError } from "rxjs";
import { NotificationService } from "./public/notification.service";
import { IOfferedService, ISubService } from "../models/offeredService.model";

@Injectable({ providedIn: 'root' })
export class OfferedServicesService {
    private http = inject(HttpClient);
    private notyf = inject(NotificationService);

    private apiUrl = API_ENV.provider;

    uploadImage(formData: FormData): Observable<{ imageUrl: string }> {
        return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/uploadImage`, formData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    sendFormData(formData: FormData) {
        return this.http.post(`${this.apiUrl}/create_service`, formData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchOfferedServices(): Observable<IOfferedService[]> {
        return this.http.get<IOfferedService[]>(`${this.apiUrl}/offered_services`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchOneService(id: string): Observable<IOfferedService> {
        return this.http.get<IOfferedService>(`${this.apiUrl}/offered_service?id=${id}`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        )
    }

    fetchSubservice(id: string): Observable<ISubService> {
        return this.http.get<ISubService>(`${this.apiUrl}/fetch_subservice?id=${id}`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        )
    }

    updateService(updateData: Partial<IOfferedService> | FormData): Observable<IOfferedService> {
        return this.http.patch<IOfferedService>(`${this.apiUrl}/offered_service`, updateData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    updateSubService(updateData: Partial<ISubService>): Observable<{ id: string, subService: ISubService }> {
        return this.http.patch<{ id: string, subService: ISubService }>(`${this.apiUrl}/subservice`, updateData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    // deleteSubService(serviceId: string, subId: string): Observable<boolean> {
    //     return this.http.delete<boolean>(`${this.apiUrl}/offered_service?serviceId=${serviceId}&subId=${subId}`).pipe(
    //         catchError((error: HttpErrorResponse) =>
    //             throwError(() =>
    //                 new Error(this.getErrorMessage(error)))
    //         )
    //     );
    // }

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}