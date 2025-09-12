import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Store } from "@ngrx/store";
import { lastValueFrom, Observable } from "rxjs";
import { BaseSocketService } from "./base-socket.service";
import { IChat, IMessage, IParticipant, ISendMessage } from "../../models/chat.model";
import { IResponse } from "../../../modules/shared/models/response.model";
import { API_ENV } from "../../../../environments/env";
import { chatActions } from "../../../store/chat/chat.action";
import { authActions } from "../../../store/auth/auth.actions";

@Injectable({ providedIn: 'root' })
export class ChatSocketService extends BaseSocketService {
    private readonly _store = inject(Store);

    private readonly _chatApi = API_ENV.chat;
    private readonly _messageApi = API_ENV.message;

    protected override namespace: string = 'chat';

    constructor(private readonly _http: HttpClient) {
        super();
    }

    protected override onConnect(): void {
        console.log('[ChatSocket] Connected');

        this._setupAuthErrorHandler();

        this.onNewMessage((message: IMessage) => {
            this._store.dispatch(chatActions.addMessage({ message }));
        });
    }

    protected override onDisconnect(reason: string): void {
        console.log('[ChatSocket] Disconnected:', reason);
        this.removeListener('newMessage');
    }

    private async _refreshTokensAndReconnect(): Promise<void> {
        try {
            await lastValueFrom(this._refreshAccessToken());
            console.log('[ChatSocket] Token refreshed successfully. Reconnecting socket...');
            this.socket?.connect();
        } catch (error) {
            console.error('[ChatSocket] Token refresh failed:', error);
            this.socket?.disconnect();
            this._store.dispatch(authActions.logout({ fromInterceptor: false, message: `${error}` }));
        }
    }

    private _setupAuthErrorHandler(): void {
        this.socket?.on('token:expired', async () => {
            console.warn('[ChatSocket] Server token:expired event received');
            await this._refreshTokensAndReconnect();
        });
    }

    sendMessage(msgContent: ISendMessage): void {
        console.log(msgContent)
        this.emit<ISendMessage>('sendMessage', msgContent);
    }

    onNewMessage(callback: (msg: IMessage) => void): void {
        this.removeListener('newMessage');
        this.listen<IMessage>('newMessage', (msg: IMessage) => {
            callback(msg);
        });
    }

    stopListeningMessages(): void {
        this.removeListener('newMessage');
    }

    private _refreshAccessToken(): Observable<void> {
        return this._http.post<void>(`${this._chatApi}/new_access_token`, {}, { withCredentials: true });
    }

    // ------------------------------------------------------------------------------------------------------------------------------
    // **************************************************[API For Chats]************************************************************
    // ------------------------------------------------------------------------------------------------------------------------------

    fetchAllChats(): Observable<IResponse<IChat[]>> {
        return this._http.get<IResponse<IChat[]>>(`${this._chatApi}/all`);
    }

    fetchChat(participant: IParticipant): Observable<IResponse<IChat>> {
        const params = new HttpParams()
            .set('id', participant.id)
            .set('type', participant.type);

        return this._http.get<IResponse<IChat>>(`${this._chatApi}/one`, { params });
    }

    // ------------------------------------------------------------------------------------------------------------------------------
    // **************************************************[API For Messages]*******************************************************
    // ------------------------------------------------------------------------------------------------------------------------------

    fetchAllMessages(chatId: string, beforeMessageId?: string): Observable<IResponse<IMessage[]>> {
        let params = new HttpParams().set('chatId', chatId);

        if (beforeMessageId) {
            params = params.set('beforeMessageId', beforeMessageId);
        }

        return this._http.get<IResponse<IMessage[]>>(`${this._messageApi}`, { params });
    }
}
