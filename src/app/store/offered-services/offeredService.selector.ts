import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IOfferedServiceState } from "../../core/models/offeredService.model";
import { offeredServiceAdaptor } from "./offeredService.entities";

export const selectOfferedServiceState = createFeatureSelector<IOfferedServiceState>('offeredServices');

export const selectOfferedServicesEntityState = createSelector(
    selectOfferedServiceState,
    (state) => state.offeredServices
);

export const selectOfferedServiceById = (serviceId: string) =>
    createSelector(
        selectOfferedServiceEntities,
        (entities) => entities[serviceId]
    );

export const {
    selectAll: selectAllOfferedServices,
    selectEntities: selectOfferedServiceEntities,
    selectIds: selectOfferedServiceIds,
    selectTotal: selectOfferedServiceTotal
} = offeredServiceAdaptor.getSelectors(selectOfferedServicesEntityState);