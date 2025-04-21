import { createFeature, createReducer, on } from "@ngrx/store";
import { providerAdaptor } from "../users/user.entities";
import { IProviderState } from "../../core/models/user.model";
import { providerActions } from "./provider.action";

export const initialProviderState: IProviderState = {
    provider: null,
    loading: false,
    error: null,
};

export const providerFeature = createFeature({
    name: 'provider',
    reducer: createReducer(
        initialProviderState,

        on(providerActions.fetchOneProvider, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(providerActions.fetchOneProviderSuccess, (state, { provider }) => ({
            ...state,
            provider,
            loading: false
        })),

        on(providerActions.fetchOneProviderFailure, (state, { error }) => ({
            ...state,
            loading: false,
            error
        }))
    )
})