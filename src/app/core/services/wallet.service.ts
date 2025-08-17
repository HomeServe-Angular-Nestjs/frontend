import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { IWallet } from "../models/wallet.model";

@Injectable()
export class WalletService {
    private readonly _http = inject(HttpClient);
    private readonly _walletUrl = API_ENV.wallet;

    getWallet(): Observable<IResponse<IWallet>> {
        return this._http.get<IResponse<IWallet>>(`${this._walletUrl}`);
    }
}