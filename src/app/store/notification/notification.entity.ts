import { createEntityAdapter, EntityAdapter } from "@ngrx/entity";
import { INotification } from "../../core/models/notification.model";

export const notificationAdaptor: EntityAdapter<INotification> = createEntityAdapter<INotification>({
    selectId: (message) => message.id,
    sortComparer: (a, b) => {
        if (!a.isRead && !b.isRead) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Both unRead → newest first
        } else if (a.isRead && b.isRead) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Both Read → oldest first
        } else {
            return a.isRead ? 1 : -1;  // UnRead always comes before isRead
        }
    }
});