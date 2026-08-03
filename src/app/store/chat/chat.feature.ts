import { createFeature, createReducer, on } from "@ngrx/store";
import { IChatState, IMessage } from "../../core/models/chat.model";
import { chatAdaptor, messageAdaptor } from "./chat.entities";
import { chatActions } from "./chat.action";

export const initialChatState: IChatState = {
    chats: chatAdaptor.getInitialState(),
    messages: messageAdaptor.getInitialState(),
    isLoadingMessages: false,
    isFetchingAllChats: false,
    hasMoreMessages: true,
    nextCursor: null,
    selectedChatId: null,
    chatsError: null,
    messagesError: null,
}

export const chatFeature = createFeature({
    name: 'chat',
    reducer: createReducer(
        initialChatState,

        on(chatActions.fetchAllChat, (state) => ({
            ...state,
            isFetchingAllChats: true,
            chatsError: null
        })),

        on(chatActions.fetchAllChatSuccess, (state, { chats }) => ({
            ...state,
            chats: chatAdaptor.setAll(chats, state.chats),
            isFetchingAllChats: false,
            chatsError: null
        })),

        on(chatActions.fetchAllChatFailure, (state, { error }) => ({
            ...state,
            isFetchingAllChats: false,
            chatsError: error,
        })),

        on(chatActions.selectChat, (state, { chatId }) => ({
            ...state,
            selectedChatId: chatId
        })),

        on(chatActions.clearSelectedChat, (state) => ({
            ...state,
            selectedChatId: null
        })),

        on(chatActions.addChat, (state, { chat }) => ({
            ...state,
            chats: chatAdaptor.upsertOne(chat, state.chats)
        })),

        on(chatActions.fetchMessages, (state, { beforeMessageId }) => ({
            ...state,
            isLoadingMessages: true,
            messagesError: null,
            ...(beforeMessageId
                ? {}
                : { hasMoreMessages: true, nextCursor: null })
        })),

        on(chatActions.fetchMessagesSuccess, (state, { messages, hasMore, nextCursor, beforeMessageId }) => {
            let updatedMessages: ReturnType<typeof messageAdaptor.getInitialState>;

            if (beforeMessageId) {
                updatedMessages = messageAdaptor.addMany(messages, state.messages);
            } else {
                const confirmedClientIds = new Set(
                    messages
                        .filter((m) => !!m.clientMessageId)
                        .map((m) => m.clientMessageId)
                );
                const pendingMessages = Object.values(state.messages.entities)
                    .filter((m): m is IMessage =>
                        !!m?.isPending && !!m.clientMessageId && !confirmedClientIds.has(m.clientMessageId)
                    );

                updatedMessages = messageAdaptor.setAll(messages, state.messages);
                if (pendingMessages.length > 0) {
                    updatedMessages = messageAdaptor.addMany(pendingMessages, updatedMessages);
                }
            }

            return {
                ...state,
                messages: updatedMessages,
                isLoadingMessages: false,
                hasMoreMessages: hasMore,
                nextCursor,
            }
        }),

        on(chatActions.fetchMessagesFailure, (state, { error }) => ({
            ...state,
            isLoadingMessages: false,
            hasMoreMessages: false,
            messagesError: error,
        })),

        on(chatActions.addPendingMessage, (state, { message }) => ({
            ...state,
            messages: messageAdaptor.addOne(message, state.messages)
        })),

        on(chatActions.addMessage, (state, { message }) => {
            let messages = state.messages;

            if (message.clientMessageId) {
                const pending = Object.values(messages.entities).find(
                    (m) => !!m?.isPending && m.clientMessageId === message.clientMessageId
                );
                if (pending?.id) {
                    messages = messageAdaptor.removeOne(pending.id, messages);
                }
            }

            return {
                ...state,
                messages: messageAdaptor.addOne(message, messages)
            }
        }),

        on(chatActions.updateChatLastMessage, (state, { chatId, lastMessage, lastSeenAt }) => ({
            ...state,
            chats: chatAdaptor.updateOne(
                { id: chatId, changes: { lastMessage, lastSeenAt } },
                state.chats
            )
        })),

        on(chatActions.clearMessages, (state) => ({
            ...state,
            messages: messageAdaptor.removeAll(state.messages),
            hasMoreMessages: true,
            nextCursor: null
        })),
    )
});