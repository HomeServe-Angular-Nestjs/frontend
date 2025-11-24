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

  getWallet(): Observable<IResponse<IWallet>> {
    return this._http.get<IResponse<IWallet>>(`${this._walletUrl}`);
  }

  getTransaction(options: { page: number, limit: number }, filters: ITransactionFilter = {}): Observable<IResponse<ITransactionUserTableData>> {
    let params = new HttpParams()
      .set('page', options.page ?? 1)
      .set('limit', options.limit ?? 5);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value);
      }
    });

    return this._http.get<IResponse<ITransactionUserTableData>>(`${this._walletUrl}/transaction/list`, { params });
  }
}
