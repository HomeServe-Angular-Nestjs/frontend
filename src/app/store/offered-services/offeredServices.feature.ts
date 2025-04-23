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
            const current = state.offeredServices.entities[id];
            if (!current || !Array.isArray(current.subService) || !subService.id) {
                return state;
            }

            const currentSubMap = new Map(
                current.subService.map((ss) => [ss.id, ss])
            );

            currentSubMap.set(subService.id, subService);
            const updatedSubServices = Array.from(currentSubMap.values());

            return {
                ...state,
                offeredServices: offeredServiceAdaptor.updateOne(
                    {
                        id,
                        changes: { subService: updatedSubServices }
                    },
                    state.offeredServices)
            };

        }),
    )
})