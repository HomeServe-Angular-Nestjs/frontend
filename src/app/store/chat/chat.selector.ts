import { createSelector } from "@ngrx/store";
import { chatAdaptor, messageAdaptor } from "./chat.entities";
import { chatFeature } from "./chat.feature";

const chatSelectors = chatAdaptor.getSelectors(chatFeature.selectChats);
const messageSelectors = messageAdaptor.getSelectors(chatFeature.selectMessages);

export const selectAllChats = chatSelectors.selectAll;

export const selectAllMessages = messageSelectors.selectAll;

export const selectIsFetchingAllChats = createSelector(
    chatFeature.selectChatState,
    (state) => state.isFetchingAllChats
);

export const selectIsLoadingMessages = createSelector(
    chatFeature.selectChatState,
    (state) => state.isLoadingMessages
);

export const selectChatEntities = chatSelectors.selectEntities;

export const selectSelectedChatId = createSelector(
    chatFeature.selectChatState,
    (state) => state.selectedChatId
);

export const selectSelectedChat = createSelector(
    selectChatEntities,
    chatFeature.selectChatState,
    (entities, state) => state.selectedChatId ? entities[state.selectedChatId] : null
);

export const selectSelectedChatsMessage = createSelector(
    selectAllMessages,
    selectSelectedChatId,
    (messages, selectedChatId) =>
        selectedChatId
            ? messages.filter(msg => msg.chatId === selectedChatId)
            : []
);

export const selectIsAllMessagesFetched = createSelector(
    chatFeature.selectChatState,
    (state) => state.isAllMessagesFetched
);



