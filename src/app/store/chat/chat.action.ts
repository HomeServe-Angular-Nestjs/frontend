import { createAction, props } from "@ngrx/store";
import { IChat, IMessage } from "../../core/models/chat.model";

export const chatActions = {
    fetchAllChat: createAction('[Chat] Fetch all chat'),
    fetchAllChatSuccess: createAction('[Chat] Fetch all chat success', props<{ chats: IChat[] }>()),
    fetchAllChatFailure: createAction('[Chat] Fetch all chat failure', props<{ error: string }>()),

    selectChat: createAction('[Chat] Update selected chat', props<{ chatId: string }>()),

    clearSelectedChat: createAction('[Chat] Clear selected chat'),

    addChat: createAction('[Chat] Add chat', props<{ chat: IChat }>()),

    fetchMessages: createAction('[Chat] Fetch messages', props<{ chatId: string, receiverId: string, beforeMessageId?: string, limit?: number }>()),
    fetchMessagesSuccess: createAction('[Chat] Fetch messages success', props<{ messages: IMessage[], hasMore: boolean, nextCursor: string | null, beforeMessageId?: string }>()),
    fetchMessagesFailure: createAction('[Chat] Fetch messages failure', props<{ error: string }>()),

    addMessage: createAction('[Chat] Add new message', props<{ message: IMessage }>()),

    addPendingMessage: createAction('[Chat] Add pending message', props<{ message: IMessage }>()),

    updateChatLastMessage: createAction('[Chat] Update chat last message', props<{ chatId: string, lastMessage: string, lastSeenAt: Date }>()),

    markMessagesRead: createAction('[Chat] Mark messages read', props<{ chatId: string }>()),

    clearMessages: createAction('[Chat] Clear messages'),
}