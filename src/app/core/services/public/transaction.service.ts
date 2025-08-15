import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../../environments/env";
import { Observable } from "rxjs";
import { IResponse } from "../../../modules/shared/models/response.model";
import { ITransactionStats, ITransactionDataWithPagination } from "../../models/transaction.model";

@Injectable({ providedIn: 'root' })
export class TransactionService {
    private readonly _http = inject(HttpClient);

    private apiUrl = API_ENV.admin;

    getTransactionStats(): Observable<IResponse<ITransactionStats>> {
        return this._http.get<IResponse<ITransactionStats>>(`${this.apiUrl}/transactions/stats`);
    }

    getTransactionTableData(page: number): Observable<IResponse<ITransactionDataWithPagination>> {
        const params = new HttpParams().set('page', page);
        return this._http.get<IResponse<ITransactionDataWithPagination>>(`${this.apiUrl}/transactions/table_data`, { params });
    }
}