// core/services/auth.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { environment } from '';
import { Observable } from 'rxjs';
import { API_ENV } from '../../environments/api.environments';
import { IResponse } from '../../modules/shared/models/response.model';
import { UserType } from '../../modules/shared/models/user.model';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = API_ENV.auth;

    checkAuth(type: UserType | null): Observable<IResponse> {
        console.log('hello')
        return this.http.get<IResponse>(`${this.apiUrl}/authenticate_user?type=${type}`, {
            withCredentials: true
        });
    }

    refreshToken(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/refresh`, null, {
            withCredentials: true
        });
    }

    logout(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/logout`, null, {
            withCredentials: true
        });
    }
}