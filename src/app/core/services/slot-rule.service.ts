import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { ISlotRule } from "../models/slot-rule.model";
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
        const oldRules = this._slotRuleSource.getValue();
        console.log(oldRules);
        this._slotRuleSource.next([...oldRules, rule]);
    }

    createRule(ruleData: ISlotRule): Observable<IResponse<ISlotRule>> {
        return this._http.post<IResponse<ISlotRule>>(`${this._slotApi}/`, ruleData);
    }

    fetchRules(): Observable<IResponse<ISlotRule[]>> {
        return this._http.get<IResponse<ISlotRule[]>>(`${this._slotApi}`);
    }
}