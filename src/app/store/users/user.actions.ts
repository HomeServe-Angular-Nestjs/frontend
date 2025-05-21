import { createAction, props } from "@ngrx/store";
import { ICustomer, IProvider } from "../../core/models/user.model";
import { IFilter } from "../../core/models/filter.model";

export const userActions = {
    fetchUsers: createAction('[User] Fetch Both Customer & Provider'),
    fetchUsersSuccess: createAction('[User] Fetch Both Customer & Provider Success', props<{ customers: ICustomer[], providers: IProvider[] }>()),
    fetchUsersFailure: createAction('[User] Fetch Both Customer & Provider', props<{ error: string }>()),

    fetchProviders: createAction('[User] Fetch Providers'),
    fetchProvidersSuccess: createAction('[User] Fetch Providers Success', props<{ providers: IProvider[] }>()),
    fetchProvidersFailure: createAction('[User] Fetch Provider Failure', props<{ error: string }>()),

    partialUpdateProvider: createAction('[User] Partial update provider', props<{ updateData: Partial<IProvider> }>()),
    partialUpdateProviderSuccess: createAction('[User] Partial update provider success', props<{ provider: IProvider }>()),
    partialUpdateProviderFailure: createAction('[User] Partial update provider failure', props<{ error: string }>()),

    partialUpdateCustomer: createAction('[User] Update Customer', props<{ updateData: Partial<ICustomer> }>()),
    partialUpdateCustomerSuccess: createAction('[User] Update Customer Success', props<{ customer: ICustomer }>()),
    partialUpdateCustomerFailure: createAction('[User] Update Customer Failure', props<{ error: string }>()),

    filterCustomer: createAction('[User] Fetch filtered customers', props<{ filter: IFilter }>()),
    filterCustomerSuccess: createAction('[User] Fetch filtered customers success', props<{ customers: ICustomer[] }>()),
    filterCustomerFailure: createAction('[User] Fetch filtered customers failure', props<{ error: string }>()),
   
    filterProvider: createAction('[User] Fetch filtered Providers', props<{ filter: IFilter }>()),
    filterProviderSuccess: createAction('[User] Fetch filtered Providers success', props<{ providers: IProvider[] }>()),
    filterProviderFailure: createAction('[User] Fetch filtered Providers failure', props<{ error: string }>()),
}