import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { ISlotRule, ISlotRulePaginatedResponse } from "../models/slot-rule.model";
import { BehaviorSubject, Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";

@Injectable({ providedIn: 'root' })
export class SlotRuleService {
    private readonly _http = inject(HttpClient);

    private _slotApi = API_ENV.rule;

    private _slotRuleSource = new BehaviorSubject<ISlotRule[]>([]);
    _slotRule$ = this._slotRuleSource.asObservable();

    setSlotRules(rules: ISlotRule[]): void {
        this._slotRuleSource.next(rules);
    }

    addSloRule(rule: ISlotRule): void {
        const existingRules = this._slotRuleSource.getValue();
        this._slotRuleSource.next([...existingRules, rule]);
    }

    removeOneRule(ruleId: string): void {
        const existingRules = this._slotRuleSource.getValue();
        const filteredRules = existingRules.filter(rule => rule.id !== ruleId);
        this._slotRuleSource.next(filteredRules);
    }

    updateRule(updatedRule: ISlotRule): void {
        const existingRules = this._slotRuleSource.getValue();
        const updatedRules = existingRules.map(rule =>
            rule.id === updatedRule.id ? updatedRule : rule
        );
        this._slotRuleSource.next(updatedRules);
    }

    createRule(ruleData: ISlotRule): Observable<IResponse<ISlotRule>> {
        return this._http.post<IResponse<ISlotRule>>(`${this._slotApi}/`, ruleData);
    }

    fetchRules(page?: number): Observable<IResponse<ISlotRulePaginatedResponse>> {
        let params = new HttpParams();
        if (page) params = params.set('page', page);

        return this._http.get<IResponse<ISlotRulePaginatedResponse>>(`${this._slotApi}`, { params });
    }

    toggleStatus(ruleId: string, status: boolean): Observable<IResponse<ISlotRule>> {
        return this._http.patch<IResponse<ISlotRule>>(`${this._slotApi}/status`, { status, ruleId });
    }

    removeRule(ruleId: string): Observable<IResponse> {
        return this._http.delete<IResponse>(`${this._slotApi}/${ruleId}`);
    }
}