import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { IWallet } from "../models/wallet.model";
import { ITransactionFilter, ITransactionUserTableData } from "../models/transaction.model";

@Injectable()
export class WalletService {
  private readonly _http = inject(HttpClient);
  private readonly _walletUrl = API_ENV.wallet;
  private readonly _providerUrl = API_ENV.provider;

  getWallet(): Observable<IResponse<IWallet>> {
    return this._http.get<IResponse<IWallet>>(`${this._walletUrl}`);
  }

  getTransaction(page: number = 1, filters: ITransactionFilter = {}): Observable<IResponse<ITransactionUserTableData>> {
    let params = new HttpParams().set('page', page);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value);
      }
    });

    return this._http.get<IResponse<ITransactionUserTableData>>(`${this._providerUrl}/transaction/list`, { params });
  }
}
