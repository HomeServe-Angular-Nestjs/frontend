import { createAction, props } from "@ngrx/store";
import { IProvider } from "../../core/models/user.model";
import { SlotType } from "../../core/models/schedules.model";

export const providerActions = {
    fetchOneProvider: createAction('[Provider] Fetches One Provider'),
    fetchOneProviderSuccess: createAction('[Provider] Fetch One Provider Success', props<{ provider: IProvider }>()),
    fetchOneProviderFailure: createAction('[Provider] Fetch One Provider Failure', props<{ error: string }>()),

    updateProvider: createAction('[Provider] Update provider', props<{ updateProviderData: FormData | Partial<IProvider> }>()),
    updateProviderSuccess: createAction('[Provider] Update provider Success', props<{ updatedProviderData: IProvider }>()),
    updateProviderFailure: createAction('[Provider] Update provider Failure', props<{ error: string }>()),

    updateProviderOfferedServices: createAction('[Provider] Update provider offered service', props<{ offeredServices: string[] }>()),
    updateDefaultSlot: createAction('[Provider] Update default slot', props<{ defaultSlots: SlotType[] }>()),
    clearDefaultSlot: createAction('[Provider] Clear Default Slot'),
}