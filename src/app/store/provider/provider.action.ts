import { createAction, props } from "@ngrx/store";
import { IProvider } from "../../core/models/user.model";

export const providerActions = {
    fetchOneProvider: createAction('[User] Fetches One Provider'),
    fetchOneProviderSuccess: createAction('[User] Fetch One Provider Success', props<{ provider: IProvider }>()),
    fetchOneProviderFailure: createAction('[User] Fetch One Provider Failure', props<{ error: string }>()),

    updateProviderStatus: createAction('[User] Update Provider Status', props<{ status: string }>()),
}