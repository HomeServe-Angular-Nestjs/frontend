import { createAction, props } from "@ngrx/store";
import { IOfferedService } from "../models/offeredService.model";

export const offeredServiceActions = {
    fetchOfferedServices: createAction('[Offered Service] Fetch services'),
    fetchOfferedServicesSuccess: createAction('[Offered Service] Fetch services success', props<{ offeredServices: IOfferedService[] }>()),
    fetchOfferedServiceFailure: createAction('[Offered Service] Fetch services failure', props<{ error: string }>()),

    updateOfferedService: createAction('[Offered Service] Update service', props<{ updateData: Partial<IOfferedService> }>()),
    updateOfferedServiceSuccess: createAction('[Offered Service] Update service success', props<{ updatedService: IOfferedService }>()),
    updateOfferedServiceFailure: createAction('[Offered Service] Update service failure', props<{ error: string }>()),
}