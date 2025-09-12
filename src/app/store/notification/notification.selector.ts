import { createSelector } from "@ngrx/store";
import { notificationAdaptor } from "./notification.entity";
import { notificationFeature } from "./notification.feature";
import { NotificationTemplateId, NotificationType } from "../../core/enums/enums";

const notificationSelectors = notificationAdaptor.getSelectors(notificationFeature.selectNotifications);
export const selectAllNotifications = notificationSelectors.selectAll;

export const hasInCompleteProfileNotification = createSelector(
    selectAllNotifications,
    (notifications) => {
        notifications.some(
            (n) => n.type === NotificationType.REMINDER && !n.isRead
        )
    }
);

export const selectTotalUnReadNotificationCount = createSelector(
    selectAllNotifications,
    (notifications) =>
        notifications.reduce((acc, notification) => !notification.isRead ? acc += 1 : acc, 0)
);

export const selectAllUnReadNotifications = createSelector(
    selectAllNotifications,
    (notifications) => notifications.filter(n => !n.isRead)
);