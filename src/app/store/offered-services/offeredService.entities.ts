import { createEntityAdapter } from "@ngrx/entity";
import { IOfferedService } from "../../core/models/offeredService.model";

export const offeredServiceAdaptor = createEntityAdapter<IOfferedService>({
    selectId: (offeredService) => offeredService.id,
    sortComparer: (a, b) => a.title.localeCompare(b.title)
})