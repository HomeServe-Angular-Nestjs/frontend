import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { ICustomer, IProvider } from "../models/user.model";
import { catchError, forkJoin, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class UserManagementService {
    private _http = inject(HttpClient);

    private readonly adminUrl = API_ENV.admin;

    getCustomers(): Observable<ICustomer[]> {
        return this._http.get<ICustomer[]>(`${this.adminUrl}/customers`).pipe(
            catchError((err) => {
                throw err
            })
        );
    }

    getProviders(): Observable<IProvider[]> {
        return this._http.get<IProvider[]>(`${this.adminUrl}/providers`).pipe(
            catchError((err) => {
                console.log(err)
                throw err
            })
        );
    }

    getUsers(): Observable<{ customers: ICustomer[], providers: IProvider[] }> {
        return forkJoin({
            customers: this.getCustomers(),
            providers: this.getProviders()
        });
    }

}