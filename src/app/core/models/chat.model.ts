import { EntityState } from "@ngrx/entity";
import { UserType } from "../../modules/shared/models/user.model";

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';
export type ChatRole = 'sender' | 'receiver';

export interface ISendMessage {
    receiverId: string;
    message: string;
    type: UserType;
    clientMessageId?: string;
}

interface IBase {
    id: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBlockedInfo {
    by: string;
    at: Date;
}

export interface IParticipant {
    id: string;
    type: UserType;
}

export interface IReceiver {
    id: string;
    type: UserType;
    avatar: string;
    name: string;
}


export interface IChat extends IBase {
    receiver: IReceiver;
    lastMessage?: string;
    lastSeenAt?: Date;
    blockedInfo?: IBlockedInfo | null;
    unreadMessages: number;
}

export interface IMessage extends IBase {
    chatId: string;
    senderId: string;
    receiverId: string;
    content: string;
    messageType: MessageType;
    attachments?: string[];
    isRead: boolean;
    clientMessageId?: string;
    isPending?: boolean;
}

export interface IMessagePage {
    messages: IMessage[];
    hasMore: boolean;
    nextCursor: string | null;
}

export interface IChatState {
    chats: EntityState<IChat>;
    messages: EntityState<IMessage>;
    selectedChatId: string | null;
    hasMoreMessages: boolean;
    nextCursor: string | null;
    isFetchingAllChats: boolean,
    isLoadingMessages: boolean;
    chatsError: string | null;
    messagesError: string | null;
}
