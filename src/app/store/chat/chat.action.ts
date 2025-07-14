import { createAction, props } from "@ngrx/store";
import { IChat, IMessage } from "../../core/models/chat.model";

export const chatActions = {
    fetchAllChat: createAction('[Chat] Fetch all chat'),
    fetchAllChatSuccess: createAction('[Chat] Fetch all chat success', props<{ chats: IChat[] }>()),
    fetchAllChatFailure: createAction('[Chat] Fetch all chat failure', props<{ error: string }>()),

    selectChat: createAction('[Chat] Update selected chat', props<{ chatId: string }>()),
    

    fetchMessages: createAction('[Chat] Fetch messages', props<{ chatId: string }>()),
    fetchMessagesSuccess: createAction('[Chat] Fetch messages success', props<{ messages: IMessage[] }>()),
    fetchMessagesFailure: createAction('[Chat] Fetch messages failure', props<{ error: string }>()),

    addMessage: createAction('[Chat] Add new message', props<{ message: IMessage }>()),

    clearMessages: createAction('[Chat] Clear messages'),
}