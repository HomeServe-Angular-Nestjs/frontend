import { createEntityAdapter } from "@ngrx/entity";
import { IOfferedService } from "../models/offeredService.model";

export const offeredServiceAdaptor = createEntityAdapter<IOfferedService>({
    selectId: (offeredService) => offeredService.id,
    sortComparer: (a, b) => a.title.localeCompare(b.title)
})