import { createFeature, createReducer, on } from "@ngrx/store";
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
            loading: false,
            error: null
        })),

        on(providerActions.fetchOneProviderFailure, (state, { error }) => ({
            ...state,
            loading: false,
            error
        })),

        on(providerActions.updateProvider, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(providerActions.addDefaultSlot, (state, { slot }) => ({
            ...state,
            provider: state.provider
                ? {
                    ...state.provider,
                    defaultSlots: [...state.provider.defaultSlots, slot]
                }
                : null
        })),

        on(providerActions.clearDefaultSlot, (state) => ({
            ...state,
            provider: state.provider
                ? {
                    ...state.provider,
                    defaultSlots: [],
                }
                : null,
            loading: false,
            error: null
        })),
    )
})