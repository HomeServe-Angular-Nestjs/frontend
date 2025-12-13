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
}