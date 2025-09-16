import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { IResponse } from "../../modules/shared/models/response.model";
import { Observable } from "rxjs";

export interface IReportSubmit {
    reason: string;
    description: string;
    targetId: string;
}

@Injectable()
export class ReportService {
    private readonly _http = inject(HttpClient);

    private readonly _reportAPI = API_ENV.report;

    submit(report: IReportSubmit): Observable<IResponse<boolean>> {
        return this._http.post<IResponse<boolean>>(`${this._reportAPI}`, report);
    }
}