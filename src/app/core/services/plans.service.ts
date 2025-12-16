import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { IPlan, IUpdatePlanStatus } from "../models/plan.model";
import { API_ENV } from "../../../environments/env";
import { IResponse } from "../../modules/shared/models/response.model";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ITable } from "../models/table.model";

@Injectable({ providedIn: 'root' })
export class PlanService {
    private readonly _http = inject(HttpClient);

    private readonly _planApi = API_ENV.plans;

    private readonly _tableDataSource = new BehaviorSubject<ITable>({ columns: [], rows: [] });
    tableData$ = this._tableDataSource.asObservable();

    get getTableData(): ITable {
        return this._tableDataSource.getValue();
    }

    set setTableData(tableData: ITable) {
        this._tableDataSource.next(tableData);
    }

    fetchPlans(): Observable<IResponse<IPlan[]>> {
        return this._http.get<IResponse<IPlan[]>>(`${this._planApi}`);
    }

    fetchOnePlan(planId: string): Observable<IResponse<IPlan>> {
        const params = new HttpParams().set('planId', planId);
        return this._http.get<IResponse<IPlan>>(`${this._planApi}/one`, { params });
    }

    updatePlanStatus(updateData: IUpdatePlanStatus): Observable<IResponse<IPlan>> {
        return this._http.patch<IResponse<IPlan>>(`${this._planApi}/status`, updateData);
    }

    updatePlan(plan: Partial<IPlan>): Observable<IResponse<IPlan>> {
        return this._http.put<IResponse<IPlan>>(`${this._planApi}/update`, plan);
    }
}
