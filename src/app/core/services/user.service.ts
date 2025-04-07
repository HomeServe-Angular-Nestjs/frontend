import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { ICustomer, IProvider } from "../../store/models/user.model";
import { forkJoin, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class UserManagementService {
    private http = inject(HttpClient);

    private apiUrl = API_ENV.admin;

    getCustomers(): Observable<ICustomer[]> {
        return this.http.get<ICustomer[]>(`${this.apiUrl}/customers`);
    }

    getProviders(): Observable<IProvider[]> {
        return this.http.get<IProvider[]>(`${this.apiUrl}/providers`);
    }

    getUsers(): Observable<{ customers: ICustomer[], providers: IProvider[] }> {
        return forkJoin({
            customers: this.getCustomers(),
            providers: this.getProviders()
        });
    }
}