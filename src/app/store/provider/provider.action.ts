import { createAction, props } from "@ngrx/store";
import { IProvider, IProviderUpdateBio } from "../../core/models/user.model";
import { SlotType } from "../../core/models/schedules.model";

export const providerActions = {
    successAction: createAction('[Provider] Success', props<{ provider: IProvider }>()),
    failureAction: createAction('[Provider] Failed', props<{ error: string }>()),

    fetchOneProvider: createAction('[Provider] Fetches One Provider'),
    updateProvider: createAction('[Provider] Update provider', props<{ updateProviderData: FormData | Partial<IProvider> }>()),
    updateBio: createAction('[Provider] update bio', props<{ updateData: IProviderUpdateBio }>()),

    updateProviderOfferedServices: createAction('[Provider] Update provider offered service', props<{ offeredServices: string[] }>()),
    updateDefaultSlot: createAction('[Provider] Update default slot', props<{ defaultSlots: SlotType[] }>()),
    clearDefaultSlot: createAction('[Provider] Clear Default Slot'),
}