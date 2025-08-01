import { ActionReducer, MetaReducer } from "@ngrx/store";
import { localStorageSync } from 'ngrx-store-localstorage';
import { AuthState } from "../../core/models/auth.model";

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    return localStorageSync({
        keys: [
            {
                auth: {
                    serialize: (state: AuthState) => ({
                        id: state.id,
                        email: state.email || null,
                        type: state.type,
                        status: state.status,
                        showSubscriptionPage: state.showSubscriptionPage,
                    }),
                    deserialize: (json) => json,
                }
            }
        ],
        rehydrate: true,
        storage: localStorage,
        removeOnUndefined: true
    })(reducer);
}

export const metaReducers: MetaReducer[] = [localStorageSyncReducer];