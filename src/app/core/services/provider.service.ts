import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IProvider } from "../../store/models/user.model";
import { API_ENV } from "../../environments/api.environments";

@Injectable({ providedIn: 'root' })
export class ProviderService {
    private http = inject(HttpClient);

    private readonly apiUrl = API_ENV;

    getProviders(): Observable<IProvider[]> {
        return this.http.get<IProvider[]>(`${this.apiUrl.provider}/fetch_providers`);
    }
}