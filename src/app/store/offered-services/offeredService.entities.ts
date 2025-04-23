import { createEntityAdapter, EntityAdapter } from "@ngrx/entity";
import { IOfferedService, ISubService } from "../../core/models/offeredService.model";

export const offeredServiceAdaptor: EntityAdapter<IOfferedService> = createEntityAdapter<IOfferedService>({
    selectId: (offeredService) => offeredService.id,
    sortComparer: (a, b) => a.title.localeCompare(b.title)
})

