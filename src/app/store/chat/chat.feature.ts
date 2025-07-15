import { createFeature, createReducer, on } from "@ngrx/store";
import { IChatState } from "../../core/models/chat.model";
import { chatAdaptor, messageAdaptor } from "./chat.entities";
import { chatActions } from "./chat.action";

export const initialChatState: IChatState = {
    chats: chatAdaptor.getInitialState(),
    messages: messageAdaptor.getInitialState(),
    isLoadingMessages: false,
    isFetchingAllChats: false,
    isAllMessagesFetched: false,
    selectedChatId: null,
    error: null,
}

export const chatFeature = createFeature({
    name: 'chat',
    reducer: createReducer(
        initialChatState,

        on(chatActions.fetchAllChat, (state) => ({
            ...state,
            isFetchingAllChats: true,
            error: null
        })),

        on(chatActions.fetchAllChatSuccess, (state, { chats }) => ({
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

        on(chatActions.fetchMessagesSuccess, (state, { messages, beforeMessageId }) => {

            // If this is a "load more" call and no messages returned, stop further fetching
            if (beforeMessageId && messages.length === 0) {
                return {
                    ...state,
                    isLoadingMessages: false,
                    isAllMessagesFetched: true
                };
            }

            // If all messages already fetched, avoid updating again
            if (state.isAllMessagesFetched && beforeMessageId) {
                return {
                    ...state,
                    isLoadingMessages: false
                };
            }

            // Apply new messages
            const updatedMessages = beforeMessageId
                ? messageAdaptor.addMany(messages, state.messages)
                : messageAdaptor.setAll(messages, state.messages);

            return {
                ...state,
                messages: updatedMessages,
                isLoadingMessages: false,
            }
        }),

        on(chatActions.fetchMessagesFailure, (state, { error }) => ({
            ...state,
            isLoadingMessages: false,
            isAllMessagesFetched: false,
            error,
        })),

        on(chatActions.addMessage, (state, { message }) => ({
            ...state,
            messages: messageAdaptor.addOne(message, state.messages)
        })),

        on(chatActions.clearMessages, (state) => ({
            ...state,
            messages: messageAdaptor.removeAll(state.messages),
            isAllMessagesFetched: false
        })),
    )
});