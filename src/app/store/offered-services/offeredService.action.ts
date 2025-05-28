import { createAction, props } from "@ngrx/store";
import { IOfferedService, ISubService, UpdateSubserviceType } from "../../core/models/offeredService.model";

export const offeredServiceActions = {
    fetchOfferedServices: createAction('[Offered Service] Fetch services'),
    fetchOfferedServicesSuccess: createAction('[Offered Service] Fetch services success', props<{ offeredServices: IOfferedService[] }>()),
    fetchOfferedServiceFailure: createAction('[Offered Service] Fetch services failure', props<{ error: string }>()),

    updateOfferedService: createAction('[Offered Service] Update service', props<{ updateData: Partial<IOfferedService> | FormData }>()),
    updateOfferedServiceSuccess: createAction('[Offered Service] Update service success', props<{ updatedService: IOfferedService }>()),
    updateOfferedServiceFailure: createAction('[Offered Service] Update service failure', props<{ error: string }>()),

    updateSubService: createAction('[Offered Service] Update sub service', props<{ updateData: UpdateSubserviceType }>()),
    updateSubServiceSuccess: createAction('[Offered Service] Update sub service success', props<{ id: string, subService: ISubService }>()),
    updateSubServiceFailure: createAction('[Offered Service] Update sub service failure', props<{ error: string }>()),

    deleteSubService: createAction('[Offered Service] Delete sub service', props<{ serviceId: string, subId: string }>()),
    deleteSubServiceSuccess: createAction('[Offered Service] Delete sub service success', props<{ serviceId: string, subId: string }>()),
    deleteSubServiceFailure: createAction('[Offered Service] Delete sub service failure', props<{ error: string }>()),
}