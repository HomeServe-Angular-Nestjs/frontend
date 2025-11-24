import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { ITransactionStats, ITransactionDataWithPagination, ITransactionFilter } from "../models/transaction.model";

@Injectable({ providedIn: 'root' })
export class TransactionService {
    private readonly _http = inject(HttpClient);

    private apiUrl = API_ENV.admin;

    getTransactionStats(): Observable<IResponse<ITransactionStats>> {
        return this._http.get<IResponse<ITransactionStats>>(`${this.apiUrl}/transactions/stats`);
    }

    getTransactionTableData(options?: { page?: number, limit?: number }, filter: ITransactionFilter = {}): Observable<IResponse<ITransactionDataWithPagination>> {
        let params = new HttpParams().set('page', options?.page ?? 1).set('limit', options?.limit ?? 10);
        Object.entries(filter).forEach(([key, value]) => {
            if (value) params = params.set(key, value);
        });

        return this._http.get<IResponse<ITransactionDataWithPagination>>(`${this.apiUrl}/transactions/table_data`, { params });
    }
}