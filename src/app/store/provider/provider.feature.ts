import { createFeature, createReducer, on } from "@ngrx/store";
import { IProvider, IProviderState } from "../../core/models/user.model";
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

        on(providerActions.successAction, (state, { provider }) => ({
            ...state,
            provider,
            loading: false,
            error: null
        })),

        on(providerActions.failureAction, (state, { error }) => ({
            ...state,
            loading: false,
            error
        })),

        on(providerActions.fetchOneProvider, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(providerActions.updateProvider, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(providerActions.updateProviderOfferedServices, (state, { offeredServices }) => ({
            ...state,
            provider: state.provider ? {
                ...state.provider,
                servicesOffered: offeredServices
            } : null
        })),

        on(providerActions.updateDefaultSlot, (state, { defaultSlots }) => ({
            ...state,
            provider: state.provider
                ? {
                    ...state.provider,
                    defaultSlots
                } : null
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

        on(providerActions.addWorkImage, (state, { workImage }) => {
            const workImages = state.provider?.workImages ?? [];
            return {
                ...state,
                provider: state.provider
                    ? {
                        ...state.provider,
                        workImages: [...workImages, workImage]
                    }
                    : null
            }
        }),
    )
})