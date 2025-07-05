import { createEntityAdapter, EntityAdapter } from "@ngrx/entity";
import { IChat, IMessage } from "../../core/models/chat.model";

export const chatAdaptor: EntityAdapter<IChat> = createEntityAdapter<IChat>({
    selectId: (chat) => chat.id,
    sortComparer: (a, b) => {
        const aTime = new Date(a.lastSeenAt ?? a.createdAt).getTime();
        const bTime = new Date(b.lastSeenAt ?? b.createdAt).getTime();
        return bTime - aTime;
    }
});

export const messageAdaptor: EntityAdapter<IMessage> = createEntityAdapter<IMessage>({
    selectId: (message) => message.id,
    sortComparer: (a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
    }
});