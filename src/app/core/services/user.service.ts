import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { ICustomer, IProvider } from "../models/user.model";
import { catchError, forkJoin, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class UserManagementService {
    private http = inject(HttpClient);

    private adminUrl = API_ENV.admin;

    getCustomers(): Observable<ICustomer[]> {
        console.log('get customer')

        return this.http.get<ICustomer[]>(`${this.adminUrl}/customers`).pipe(
            catchError((err) => {
                throw err
            })
        );
    }

    getProviders(): Observable<IProvider[]> {
        console.log('get provider')

        return this.http.get<IProvider[]>(`${this.adminUrl}/providers`).pipe(
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
    // updateUser<T extends ICustomer | IProvider>
    //     (email: string, data: UserUpdationType, type: UserType):
    //     Observable<T> {
    //     console.warn('Need to change this later.');
    //     console.error('use the localstorage to append the user type on every req.');
    //     return this.http.patch<T>(`${this.customerUrl}`, { email, data, type });
    // }
}