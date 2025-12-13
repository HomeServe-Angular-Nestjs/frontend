import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { IAdminTransactionDataWithPagination, ICustomerTransactionDataWithPagination, IProviderTransactionDataWithPagination, IProviderTransactionOverview, IWallet } from "../models/wallet.model";
import { ITransactionFilter, ITransactionStats } from "../models/transaction.model";

@Injectable()
export class WalletService {
  private readonly _http = inject(HttpClient);
  private readonly _walletUrl = API_ENV.wallet;
  private readonly _adminUrl = API_ENV.admin;

  getWallet(): Observable<IResponse<IWallet>> {
    return this._http.get<IResponse<IWallet>>(`${this._walletUrl}`);
  }

  getTransaction(options: { page: number, limit: number }, filters: ITransactionFilter = {}): Observable<IResponse<ICustomerTransactionDataWithPagination>> {
    let params = new HttpParams()
      .set('page', options.page ?? 1)
      .set('limit', options.limit ?? 5);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value);
      }
    });

    return this._http.get<IResponse<ICustomerTransactionDataWithPagination>>(`${this._walletUrl}/transaction/list`, { params });
  }

  getTransactionListForProvider(filters: ITransactionFilter & { page?: number, limit?: number } = {}): Observable<IResponse<IProviderTransactionDataWithPagination>> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value);
      }
    });

    return this._http.get<IResponse<IProviderTransactionDataWithPagination>>(`${this._walletUrl}/provider/transaction/list`, { params });
  }

  getProviderTransactionOverview(): Observable<IResponse<IProviderTransactionOverview>> {
    return this._http.get<IResponse<IProviderTransactionOverview>>(`${this._walletUrl}/provider/transaction/overview`);
  }

  getTransactionListForAdmin(filters: ITransactionFilter = {}): Observable<IResponse<IAdminTransactionDataWithPagination>> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value);
      }
    });

    return this._http.get<IResponse<IAdminTransactionDataWithPagination>>(`${this._adminUrl}/transactions/lists`, { params });
  }

  getTransactionStats(): Observable<IResponse<ITransactionStats>> {
    return this._http.get<IResponse<ITransactionStats>>(`${this._adminUrl}/transactions/stats`);
  }
}
