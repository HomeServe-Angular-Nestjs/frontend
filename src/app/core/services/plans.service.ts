import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, throwError } from "rxjs";
import { ISavePlan, IPlan, IUpdatePlanStatus, IUpdatePlan } from "../models/plan.model";
import { API_ENV } from "../../../environments/env";
import { IResponse } from "../../modules/shared/models/response.model";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { ITable } from "../models/table.model";

@Injectable({ providedIn: 'root' })
export class PlanService {
    private readonly _http = inject(HttpClient);

    private readonly _planApi = API_ENV.plans;

    private readonly _tableDataSource = new BehaviorSubject<ITable>({ columns: [], rows: [] });
    tableData$ = this._tableDataSource.asObservable();

    private _getErrorMessage(error: HttpErrorResponse): string {
        return error?.error || error?.error?.message || error.message || 'Something went wrong. Please try again!';
    }

    get getTableData(): ITable {
        return this._tableDataSource.getValue();
    }

    set setTableData(tableData: ITable) {
        this._tableDataSource.next(tableData);
    }

    fetchPlans(): Observable<IResponse<IPlan[]>> {
        return this._http.get<IResponse<IPlan[]>>(`${this._planApi}`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this._getErrorMessage(error)))
            )
        );
    }

    fetchOnePlan(planId: string): Observable<IResponse<IPlan>> {
        const params = new HttpParams().set('planId', planId);
        return this._http.get<IResponse<IPlan>>(`${this._planApi}/one`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this._getErrorMessage(error)))
            )
        );
    }

    createPlan(plan: ISavePlan): Observable<IResponse<IPlan>> {
        return this._http.post<IResponse<IPlan>>(`${this._planApi}`, plan).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this._getErrorMessage(error)))
            )
        );
    }

    updatePlan(plan: IUpdatePlan): Observable<IResponse<IPlan>> {
        return this._http.put<IResponse>(`${this._planApi}`, plan).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this._getErrorMessage(error)))
            )
        );
    }

    updatePlanStatus(updateData: IUpdatePlanStatus): Observable<IResponse<IPlan>> {
        return this._http.patch<IResponse<IPlan>>(`${this._planApi}/status`, updateData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this._getErrorMessage(error)))
            )
        );
    }

    deletePlan(planId: string): Observable<IResponse> {
        return this._http.patch<IResponse>(`${this._planApi}`, { planId }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this._getErrorMessage(error)))
            )
        );
    }
}
