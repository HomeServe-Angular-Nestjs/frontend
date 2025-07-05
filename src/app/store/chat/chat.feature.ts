import { createFeature, createReducer, on } from "@ngrx/store";
import { IChatState } from "../../core/models/chat.model";
import { chatAdaptor, messageAdaptor } from "./chat.entities";
import { chatActions } from "./chat.action";

export const inititalChatState: IChatState = {
    chats: chatAdaptor.getInitialState(),
    messages: messageAdaptor.getInitialState(),
    isLoadingMessages: false,
    isFetchingAllChats: false,
    selectedChatId: null,
    error: null
}


export const chatFeature = createFeature({
    name: 'chat',
    reducer: createReducer(
        inititalChatState,

        on(chatActions.fetchAllChat, (state) => ({
            ...state,
            isFetchingAllChats: true,
            error: null
        })),

        on(chatActions.fetchAllChatSsuccess, (state, { chats }) => ({
            ...state,
            chats: chatAdaptor.setAll(chats, state.chats),
            isFetchingAllChats: false,
            error: null
        })),

        on(chatActions.fetchAllChatFailure, (state, { error }) => ({
            ...state,
            isFetchingAllChats: false,
            error,
        })),

        on(chatActions.selectChat, (state, { chatId }) => ({
            ...state,
            selectedChatId: chatId
        })),

        on(chatActions.fetchMessages, (state) => ({
            ...state,
            isLoadingMessages: true,
            error: null
        })),

        on(chatActions.fetchMessagesSuccess, (state, { messages }) => ({
            ...state,
            messages: messageAdaptor.setAll(messages, state.messages),
            isLoadingMessages: false
        })),

        on(chatActions.fetchMessagesFailure, (state, { error }) => ({
            ...state,
            isLoadingMessages: false,
            error,
        })),

        on(chatActions.addMessage, (state, { message }) => ({
            ...state,
            messages: messageAdaptor.addOne(message, state.messages)
        })),

        on(chatActions.clearMessages, (state) => ({
            ...state,
            messages: messageAdaptor.removeAll(state.messages),
        })),
    )
});