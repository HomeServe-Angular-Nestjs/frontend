import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { API_ENV } from "../../../environments/env";

@Injectable()
export class AnalyticService {
    private readonly _http = inject(HttpClient);
    private readonly _apiUrl = API_ENV.analytics;

    getPerformanceSummary(): Observable<IResponse> {
        return this._http.get<IResponse>(`${this._apiUrl}/performance_summary`)
    }
}