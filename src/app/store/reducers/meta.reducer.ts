import { ActionReducer, MetaReducer } from "@ngrx/store";
import { localStorageSync } from 'ngrx-store-localstorage';
import { authFeature } from "../feature/auth.feature";
import { AuthState } from "../models/auth.model";

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    return localStorageSync({
        keys: [
            {
                auth: {
                    serialize: (state: AuthState) => ({
                        user: state.user ? {
                            email: state.user.email,
                            type: state.user.type
                        } : null,
                        status: state.status
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