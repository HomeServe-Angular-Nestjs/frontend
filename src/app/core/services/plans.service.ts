import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, throwError } from "rxjs";
import { ICreatePlan, IPlan, IUpdatePlanStatus } from "../models/plan.model";
import { API_ENV } from "../../environments/env";
import { IResponse } from "../../modules/shared/models/response.model";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class PlanService {
    private readonly _http = inject(HttpClient);

    private _planDataSource = new BehaviorSubject<IPlan[] | null>(null);
    plans$ = this._planDataSource.asObservable();

    private readonly _planApi = API_ENV.plans;

    private _getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }

    fetchPlans(): Observable<IResponse<IPlan[]>> {
        return this._http.get<IResponse<IPlan[]>>(`${this._planApi}`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this._getErrorMessage(error)))
            )
        );
    }

    createPlan(plan: ICreatePlan): Observable<IResponse> {
        return this._http.post<IResponse>(`${this._planApi}`, plan).pipe(
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

}
