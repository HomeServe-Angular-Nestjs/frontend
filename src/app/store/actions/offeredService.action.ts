import { createAction, props } from "@ngrx/store";
import { IOfferedService } from "../models/offeredService.model";

export const offeredServiceActions = {
    fetchOfferedServices: createAction('[Offered Service] Fetch services'),
    fetchOfferedServicesSuccess: createAction('[Offered Service] Fetch services success', props<{ offeredServices: IOfferedService[] }>()),
    fetchOfferedServiceFailure: createAction('[Offered Service] Fetch services failure', props<{ error: string }>()),

}