import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { ICustomer, IProvider, UserUpdationType } from "../../store/models/user.model";
import { forkJoin, Observable, tap } from "rxjs";
import { UserType } from "../../modules/shared/models/user.model";

@Injectable({ providedIn: 'root' })
export class UserManagementService {
    private http = inject(HttpClient);

    private adminUrl = API_ENV.admin;
    private customerUrl = API_ENV.customer;
    private providerUrl = API_ENV.provider;

    getCustomers(): Observable<ICustomer[]> {
        return this.http.get<ICustomer[]>(`${this.adminUrl}/customers`);
    }

    getProviders(): Observable<IProvider[]> {
        return this.http.get<IProvider[]>(`${this.adminUrl}/providers`);
    }

    getUsers(): Observable<{ customers: ICustomer[], providers: IProvider[] }> {
        return forkJoin({
            customers: this.getCustomers(),
            providers: this.getProviders()
        });
    }

    updateUser<T extends ICustomer | IProvider>
        (email: string, data: UserUpdationType, type: UserType):
        Observable<T> {
        console.warn('Need to change this later.');
        console.error('use the localstorage to append the user type on every req.');
        return this.http.patch<T>(`${this.customerUrl}`, { email, data, type });
    }

}