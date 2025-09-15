import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { IAvailableSlot, IRuleFilter, ISlotRule, ISlotRulePaginatedResponse } from "../models/slot-rule.model";
import { BehaviorSubject, map, Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";

@Injectable({ providedIn: 'root' })
export class SlotRuleService {
    private readonly _http = inject(HttpClient);

    private _slotApi = API_ENV.rule;

    private _slotRuleSource = new BehaviorSubject<ISlotRule[]>([]);
    _slotRule$ = this._slotRuleSource.asObservable();

    private _ruleFilterSource = new BehaviorSubject<IRuleFilter>({});
    _ruleFilter$ = this._ruleFilterSource.asObservable();

    private _availableSlotSource = new BehaviorSubject<IAvailableSlot[]>([]);
    _availableSlots$ = this._availableSlotSource.asObservable();

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

    setRuleFilter(filter: IRuleFilter) {
        this._ruleFilterSource.next(filter);
    }

    createRule(ruleData: ISlotRule): Observable<IResponse<ISlotRule>> {
        return this._http.post<IResponse<ISlotRule>>(`${this._slotApi}`, ruleData);
    }

    fetchRules(filter: IRuleFilter, page?: number): Observable<IResponse<ISlotRulePaginatedResponse>> {
        let params = new HttpParams();

        for (let [key, value] of Object.entries(filter)) {
            if (value !== undefined && value !== null) {
                params = params.set(key, value);
            }
        }

        if (page) params = params.set('page', page);

        return this._http.get<IResponse<ISlotRulePaginatedResponse>>(`${this._slotApi}`, { params });
    }

    editRule(ruleId: string, ruleData: Partial<ISlotRule>): Observable<IResponse<ISlotRule>> {
        return this._http.put<IResponse<ISlotRule>>(`${this._slotApi}/${ruleId}`, ruleData);
    }

    toggleStatus(ruleId: string, status: boolean): Observable<IResponse<ISlotRule>> {
        return this._http.patch<IResponse<ISlotRule>>(`${this._slotApi}/status`, { status, ruleId });
    }

    removeRule(ruleId: string): Observable<IResponse> {
        return this._http.delete<IResponse>(`${this._slotApi}/${ruleId}`);
    }

    fetchAvailableSlots(providerId: string, date: string): void {
        const params = new HttpParams().set('date', date);
        this._http.get<IResponse<IAvailableSlot[]>>(`${this._slotApi}/available_slots/${providerId}`, { params }).pipe(
            map(res => {
                console.log(res)
                if (res.success && res.data) return res.data;
                else return [];
            })
        ).subscribe(slots => this._availableSlotSource.next(slots));
    }
}