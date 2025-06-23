import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/env";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";

@Injectable({ providedIn: 'root' })
export class ChatService {
    private readonly _http = inject(HttpClient);

    private readonly _chatApi = API_ENV.chat;

    createChat(userId: string): Observable<IResponse> {
        return this._http.post<IResponse>(`${this._chatApi}/`, { userId }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => new Error(this.getErrorMessage(error)))
            )
        );
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}