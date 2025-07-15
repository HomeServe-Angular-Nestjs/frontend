import { EntityState } from "@ngrx/entity";
import { UserType } from "../../modules/shared/models/user.model";

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';
export type ChatRole = 'sender' | 'receiver';

export interface ISendMessage {
    receiverId: string;
    message: string;
    type: UserType
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
}

export interface IChatState {
    chats: EntityState<IChat>;
    messages: EntityState<IMessage>;
    selectedChatId: string | null;
    isAllMessagesFetched: boolean,
    isFetchingAllChats: boolean,
    isLoadingMessages: boolean;
    error: string | null;
}
