import { createEntityAdapter } from "@ngrx/entity";
import { ICustomer, IProvider } from "../models/user.model";

export const customerAdaptor = createEntityAdapter<ICustomer>({
    selectId: (customer) => customer.id,
    sortComparer: (a, b) => a.username.localeCompare(b.username)
});

export const providerAdaptor = createEntityAdapter<IProvider>({
    selectId: (provider) => provider.id,
    sortComparer: (a, b) => a.username.localeCompare(b.username)
});
