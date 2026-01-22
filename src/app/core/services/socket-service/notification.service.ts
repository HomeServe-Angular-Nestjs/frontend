import { inject, Injectable } from "@angular/core";
import { BaseSocketService, ISocketError } from "./base-socket.service";
import { API_ENV } from "../../../../environments/env";
import { INotification, ISendNewNotification } from "../../models/notification.model";
import { lastValueFrom, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Store } from "@ngrx/store";
import { authActions } from "../../../store/auth/auth.actions";
import { IResponse } from "../../../modules/shared/models/response.model";
import { notificationAction } from "../../../store/notification/notification.action";
import { NotificationTemplateId, NotificationType } from "../../enums/enums";

@Injectable({ providedIn: 'root' })
export class NotificationSocketService extends BaseSocketService {
    private readonly _store = inject(Store);

    protected override namespace: string = '/notification';

    private readonly _notificationApi = API_ENV.notification;
    private readonly NEW_NOTIFICATION = 'notification:new';
    private readonly MARK_AS_READ = 'notification:read';
    private readonly REMOVE_NOTIFICATION = 'notification:remove';


    constructor(private readonly _http: HttpClient) {
        super();
    }

    protected override onConnect(): void {
        console.log('[NotificationSocket] Connected');
        this._setupAuthErrorHandler();

        this.onNewNotification((newNotification: INotification) =>
            this._store.dispatch(notificationAction.addNotification({ notification: newNotification }))
        );

        this.onMarkAsRead((notification: INotification) =>
            this._store.dispatch(notificationAction.markAsRead({ notification }))
        );

        this.onRemoveNotification((id: string) =>
            this._store.dispatch(notificationAction.removeNotification({ id }))
        );
    }

    protected override onDisconnect(): void {
        this.stopListeningNotifications();
        this.removeListener(this.MARK_AS_READ);
    }

    private async _refreshTokensAndReconnect(): Promise<void> {
        try {
            await lastValueFrom(this._refreshAccessToken());
            console.log('[NotificationSocket] Token refreshed successfully. Reconnecting socket...');
            this.socket?.connect();
        } catch (error) {
            console.error('[NotificationSocket] Token refresh failed:', error);
            this.socket?.disconnect();
            this._store.dispatch(authActions.logout({ fromInterceptor: false, message: `${error}` }));
        }
    }

    private _setupAuthErrorHandler(): void {
        this.socket?.on('token:expired', async () => {
            console.warn('[NotificationSocket] Server token:expired event received');
            await this._refreshTokensAndReconnect();
        })
    }

    // !TODO - make this private
    onNewNotification(callback: (notification: INotification) => void): void {
        this.stopListeningNotifications();
        this.listen<INotification>(this.NEW_NOTIFICATION, (notification: INotification) => callback(notification));
    }

    onMarkAsRead(callback: (notification: INotification) => void): void {
        this.removeListener(this.MARK_AS_READ);
        this.listen(this.MARK_AS_READ, (notification: INotification) => callback(notification));
    }

    onRemoveNotification(callback: (notificationId: string) => void) {
        this.stopListeningNotifications();
        this.listen(this.REMOVE_NOTIFICATION, (id: string) => callback(id));
    }

    sendNewNotification(notification: ISendNewNotification) {
        this.emit<ISendNewNotification>(this.NEW_NOTIFICATION, notification);
    }

    markAsRead(id: string): void {
        this.emit<{ id: string }>(this.MARK_AS_READ, { id });
    }

    removeNotification(templateId: NotificationTemplateId): void {
        this.emit<{ templateId: NotificationTemplateId }>(this.REMOVE_NOTIFICATION, { templateId });
    }

    stopListeningNotifications(): void {
        this.removeListener(this.NEW_NOTIFICATION);
    }

    private _refreshAccessToken(): Observable<void> {
        return this._http.post<void>(`${this._notificationApi}/new_access_token`, {}, { withCredentials: true });
    }

    // ------------------------------------------------------------------------------------------------------------------------------
    // **************************************************[API For Notification]************************************************************
    // ------------------------------------------------------------------------------------------------------------------------------

    fetchAllNotifications(): Observable<IResponse<INotification[]>> {
        return this._http.get<IResponse<INotification[]>>(`${this._notificationApi}`);
    }

    markAsReadApi(id: string): Observable<IResponse<INotification>> {
        return this._http.patch<IResponse<INotification>>(`${this._notificationApi}/mark-read/${id}`, {});
    }

    markAllAsReadApi(): Observable<IResponse<void>> {
        return this._http.patch<IResponse<void>>(`${this._notificationApi}/mark-all-read`, {});
    }

    deleteNotificationApi(id: string): Observable<IResponse<void>> {
        return this._http.delete<IResponse<void>>(`${this._notificationApi}/${id}`);
    }

    clearAllApi(): Observable<IResponse<void>> {
        return this._http.delete<IResponse<void>>(`${this._notificationApi}/clear-all`);
    }

    sendNotification(type: NotificationType) {
        return this._http.post(`${this._notificationApi}/send_notification`, { type });
    }

}