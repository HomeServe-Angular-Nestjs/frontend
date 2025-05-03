import { createFeature, createReducer, on } from "@ngrx/store";
import { offeredServiceAdaptor } from "./offeredService.entities";
import { IOfferedServiceState } from "../../core/models/offeredService.model";
import { offeredServiceActions } from "./offeredService.action";

export const initialOfferedServiceState: IOfferedServiceState = {
    offeredServices: offeredServiceAdaptor.getInitialState(),
    loading: false,
    error: null
};

export const offeredServiceFeature = createFeature({
    name: 'offeredServices',
    reducer: createReducer(
        initialOfferedServiceState,

        on(offeredServiceActions.fetchOfferedServices, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(offeredServiceActions.fetchOfferedServicesSuccess, (state, { offeredServices }) => ({
            ...state,
            offeredServices: offeredServiceAdaptor.setAll(offeredServices ?? [], state.offeredServices),
            loading: false,
            error: null
        })),

        on(offeredServiceActions.fetchOfferedServiceFailure, (state, { error }) => ({
            ...state,
            error,
            loading: false,
        })),

        on(offeredServiceActions.updateOfferedService, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(offeredServiceActions.updateOfferedServiceSuccess, (state, { updatedService }) => {
            if (!updatedService) {
                return {
                    ...state,
                    loading: false,
                    error: 'No updated service data received.'
                };
            }

            return {
                ...state,
                offeredServices: offeredServiceAdaptor.updateOne(
                    {
                        id: updatedService.id,
                        changes: updatedService
                    },
                    state.offeredServices
                ),
                loading: false,
                error: null
            }
        }),

        on(offeredServiceActions.updateOfferedServiceFailure, (state, { error }) => ({
            ...state,
            error,
            loading: false
        })),

        on(offeredServiceActions.updateSubService, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(offeredServiceActions.updateSubServiceSuccess, (state, { subService, id }) => {
            const currentService = state.offeredServices.entities[id];

            if (!currentService || !Array.isArray(currentService.subService)) {
                return state;
            }

            const updatedSubServices = currentService.subService.map(ss =>
                ss.id === subService.id ? { ...ss, ...subService } : ss
            );

            return {
                ...state,
                offeredServices: offeredServiceAdaptor.updateOne(
                    {
                        id,
                        changes: { subService: updatedSubServices }
                    },
                    state.offeredServices
                )
            };
        }),

        on(offeredServiceActions.updateSubServiceFailure, (state, { error }) => ({
            ...state,
            error,
            loading: false
        })),

        // on(offeredServiceActions.deleteSubService, (state) => ({
        //     ...state,
        //     loading: true,
        //     error: null,
        // })),

        // on(offeredServiceActions.deleteSubServiceSuccess, (state, { serviceId, subId }) => {
        //     const existingService = state.offeredServices.entities[serviceId];
        //     console.log('existingService: ', existingService);

        //     if (!existingService) {
        //         return {
        //             ...state,
        //             loading: false,
        //             error: 'Service not found in state.'
        //         };
        //     }

        //     const updatedSubServices = existingService.subService?.filter(sub => sub.id !== subId) || [];

        //     const updatedService = {
        //         ...existingService,
        //         subService: updatedSubServices
        //     };

        //     console.log('updatedService: ', updatedService);

        //     return {
        //         ...state,
        //         offeredServices: offeredServiceAdaptor.updateOne(
        //             {
        //                 id: serviceId,
        //                 changes: updatedService
        //             },
        //             state.offeredServices
        //         ),
        //         loading: false,
        //         error: null,
        //     };
        // }),

        // on(offeredServiceActions.deleteSubServiceFailure, (state, { error }) => ({
        //     ...state,
        //     error,
        //     loading: false
        // })),

    )
});