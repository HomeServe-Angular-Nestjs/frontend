import { inject, Injectable } from "@angular/core";
import { BaseSocketService } from "./base-socket.service";
import { BehaviorSubject, catchError, Observable, throwError } from "rxjs";
import { IChat, IMessage, IParticipant, ISendMessage } from "../../models/chat.model";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { IResponse } from "../../../modules/shared/models/response.model";
import { API_ENV } from "../../../environments/env";
import { Store } from "@ngrx/store";
import { chatActions } from "../../../store/chat/chat.action";

@Injectable({ providedIn: 'root' })
export class ChatSocketService extends BaseSocketService {
    private readonly _store = inject(Store);

    private readonly _chatApi = API_ENV.chat;
    private readonly _messageApi = API_ENV.message;
    private readonly _maxRetries = 5;
    private _retryCount = 0;

    constructor(private readonly _http: HttpClient) {
        super();
        this._setupAuthErrorHandler();
    }

    protected override onConnect(): void {
        console.log('[ChatSocket] Connected');
        this._retryCount = 0;
        this.onNewMessage((message: IMessage) => {
            this._store.dispatch(chatActions.addMessage({ message }));
        })
    }

    protected override onDisconnect(reason: string): void {
        console.log('[ChatSocket] Disconnected:', reason);
        this.removeListener('newMessage');

        if (reason !== 'io client disconnect' && this._retryCount < this._maxRetries) {
            this._retryCount++;
            this.onAuthError();
        }
    }

    protected override onAuthError(): void {
        console.warn('[ChatSocket] Auth error detected. Attempting to reconnect...');
        this.socket?.disconnect();
        setTimeout(() => this.socket?.connect(), 1000 * this._retryCount);
    }

    private _setupAuthErrorHandler(): void {
        this.socket?.on('auth-error', (msg) => {
            console.warn('[ChatSocket] Server auth-error event received:', msg);
            this.onAuthError();
        });
    }

    sendMessage(msgContent: ISendMessage): void {
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


    // ------------------------------------------------------------------------------------------------------------------------------
    // **************************************************[API For Chats]*******************************************************
    // ------------------------------------------------------------------------------------------------------------------------------

    fetchAllChats(): Observable<IResponse<IChat[]>> {
        return this._http.get<IResponse<IChat[]>>(`${this._chatApi}/all`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchChat(participant: IParticipant): Observable<IResponse<IChat>> {
        const params = new HttpParams()
            .set('id', participant.id)
            .set('type', participant.type);

        return this._http.get<IResponse<IChat>>(`${this._chatApi}/one`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------------
    // **************************************************[API For Messages]*******************************************************
    // ------------------------------------------------------------------------------------------------------------------------------

    fetchAllMessages(chatId: string, beforeMessageId?: string): Observable<IResponse<IMessage[]>> {
        let params = new HttpParams().set('chatId', chatId);

        if (beforeMessageId) {
            params = params.set('beforeMessageId', beforeMessageId);
        }

        return this._http.get<IResponse<IMessage[]>>(`${this._messageApi}`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}
