import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ChatSocketService } from "../../../../../../core/services/socket-service/chat.service";
import { FormsModule } from "@angular/forms";
import { filter, map, Observable, Subject, takeUntil } from "rxjs";
import { Store } from "@ngrx/store";
import { IChat, IMessage, IParticipant, ISendMessage } from "../../../../../../core/models/chat.model";
import { selectSelectedChat, selectSelectedChatsMessage } from "../../../../../../store/chat/chat.selector";
import { UserType } from "../../../../models/user.model";
import { selectAuthUserId } from "../../../../../../store/auth/auth.selector";

@Component({
    selector: 'app-chat-message-area',
    templateUrl: './chat-message-area.component.html',
    imports: [CommonModule, FormsModule],
})
export class ChatMessageComponent implements OnInit, OnDestroy {
    private readonly _chatSocketService = inject(ChatSocketService);
    private readonly _store = inject(Store);

    private readonly _destroy$ = new Subject<void>();

    messages$: Observable<IMessage[]> = this._chatSocketService._messages$;
    chat$!: Observable<IChat>;
    currentUserId!: string;
    receiverId!: string;
    receiverType: UserType = 'customer';
    textMessage: string = '';

    ngOnInit(): void {
        this._store.select(selectSelectedChatsMessage).pipe(
            map(messages => (messages ?? []).filter(msg => !!msg)),
            takeUntil(this._destroy$),
        ).subscribe(messages => this._chatSocketService.setMessages(messages));

        this.chat$ = this._store.select(selectSelectedChat).pipe(
            filter(chat => !!chat),
            takeUntil(this._destroy$)
        );

        this._store.select(selectAuthUserId).pipe(takeUntil(this._destroy$)).subscribe(id => {
            if (id) this.currentUserId = id;
        });

        this.chat$.subscribe(chat => {
            const receiver = chat.receiver;
            if (receiver) {
                this.receiverId = receiver.id;
                this.receiverType = receiver.type;
            }
        });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    sendMessage() {
        const trimmedMessage = this.textMessage.trim();
        if (!trimmedMessage) return;

        const msgContent: ISendMessage = {
            message: trimmedMessage,
            receiverId: this.receiverId,
            type: this.receiverType
        };

        this._chatSocketService.sendMessage(msgContent);
        this.textMessage = '';
    }

}