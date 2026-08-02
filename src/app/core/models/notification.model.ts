import { EntityState } from "@ngrx/entity";
import { NotificationTemplateId, NotificationType } from "../enums/enums";

export interface INotification {
    id: string;
    userId: string;
    type: NotificationType;
    templateId: NotificationTemplateId,
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    entityId?: string;
    metadata?: Record<string, any>;
}

export interface INotificationState {
    notifications: EntityState<INotification>;
    cursor: string | null;
    hasMore: boolean;
    loading: boolean;
    error: string | null;
}

export interface INotificationPage {
    data: INotification[];
    nextCursor: string | null;
    hasMore: boolean;
}

export interface ISendNewNotification {
    type: NotificationType;
    message: string;
    title: string;
    templateId: NotificationTemplateId,
    entityId?: string;
    metadata?: Record<string, any>;
}

export interface IReadNotification {
    templateId: NotificationTemplateId,
}
