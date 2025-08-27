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
}

export interface INotificationState {
    notifications: EntityState<INotification>;
    loading: boolean;
    error: string | null;
}

export interface ISendNewNotification {
    type: NotificationType;
    message: string;
    title: string;
    templateId: NotificationTemplateId,
}

export interface IReadNotification {
    templateId: NotificationTemplateId,
}