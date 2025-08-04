import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { ISlotRule } from "../models/slot-rule.model";
import { Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";

@Injectable({ providedIn: 'root' })
export class SlotRuleService {
    private readonly _http = inject(HttpClient);

    private _slotApi = API_ENV.rule;

    createRule(ruleData: ISlotRule): Observable<IResponse> {
        return this._http.post<IResponse>(`${this._slotApi}/`, ruleData);
    }
}