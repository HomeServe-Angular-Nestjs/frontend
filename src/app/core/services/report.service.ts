import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { IResponse } from "../../modules/shared/models/response.model";
import { Observable } from "rxjs";
import { IReport, IReportDetail, IReportFilter, IReportOverViewMatrix, IReportWithPagination } from "../models/report.model";
import { ReportStatus } from "../enums/enums";

export interface IReportSubmit {
    reason: string;
    description: string;
    targetId: string;
}

@Injectable()
export class ReportService {
    private readonly _http = inject(HttpClient);
    private readonly _reportAPI = API_ENV.report;

    submit(report: IReportSubmit): Observable<IResponse> {
        return this._http.post<IResponse>(`${this._reportAPI}`, report);
    }

    fetchAll(filter: IReportFilter): Observable<IResponse<IReportWithPagination>> {
        let params = new HttpParams();

        for (const [key, value] of Object.entries(filter)) {
            if (key !== undefined && value !== null) {
                params = params.set(key, value);
            }
        }

        return this._http.get<IResponse<IReportWithPagination>>(`${this._reportAPI}`, { params });
    }

    fetchOne(reportId: string): Observable<IResponse<IReportDetail>> {
        return this._http.get<IResponse<IReportDetail>>(`${this._reportAPI}/${reportId}`)
    }

    changeStatus(reportId: string, status: ReportStatus): Observable<IResponse> {
        return this._http.patch<IResponse>(`${this._reportAPI}/${reportId}/status`, { status });
    }

    fetchOverviewData(): Observable<IResponse<IReportOverViewMatrix>> {
        return this._http.get<IResponse<IReportOverViewMatrix>>(`${this._reportAPI}/overview`);
    }
}