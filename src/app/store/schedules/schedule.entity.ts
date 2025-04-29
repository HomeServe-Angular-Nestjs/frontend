import { createEntityAdapter, EntityAdapter } from "@ngrx/entity";
import { ISchedule } from "../../core/models/schedules.model";

export const scheduleAdaptor: EntityAdapter<ISchedule> = createEntityAdapter<ISchedule>({
    selectId: (schedules) => schedules.id,
    sortComparer: (a, b) => {
        const dateA = a.scheduleDate ? new Date(a.scheduleDate).getTime() : 0;
        const dateB = b.scheduleDate ? new Date(b.scheduleDate).getTime() : 0;
        return dateA - dateB;
    }
});