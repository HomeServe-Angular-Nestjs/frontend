import { Injectable } from "@angular/core";
import { IUser } from "../../modules/shared/models/user.model";
import { HttpClient } from "@angular/common/http";
import { API_ENV } from "../../environments/api.environments";

@Injectable({ providedIn: "root" })
export class LoginService {
    private apiUrl = API_ENV.loginAuth;

    constructor(private http: HttpClient) { }

    authCredentials(user: IUser) {
        return this.http.post(`${this.apiUrl}/auth`, user)
    }
}