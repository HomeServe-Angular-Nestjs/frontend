import { createFeature, createReducer, on } from "@ngrx/store";
import { offeredServiceAdaptor } from "../entities/offeredService.entities";
import { IOfferedServiceState } from "../models/offeredService.model";
import { offeredServiceActions } from "../actions/offeredService.action";

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
    )
})