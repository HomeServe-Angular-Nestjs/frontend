import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, ElementRef, inject, NgZone, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ChatSocketService } from "../../../../../../core/services/socket-service/chat.service";
import { FormsModule } from "@angular/forms";
import { filter, map, Observable, Subject, take, takeUntil, tap } from "rxjs";
import { Store } from "@ngrx/store";
import { IChat, IMessage, ISendMessage } from "../../../../../../core/models/chat.model";
import { selectIsAllMessagesFetched, selectSelectedChat, selectSelectedChatsMessage } from "../../../../../../store/chat/chat.selector";
import { UserType } from "../../../../models/user.model";
import { selectAuthUserId } from "../../../../../../store/auth/auth.selector";
import { chatActions } from "../../../../../../store/chat/chat.action";

@Component({
    selector: 'app-chat-message-area',
    templateUrl: './chat-message-area.component.html',
    imports: [CommonModule, FormsModule],
})
export class ChatMessageComponent implements OnInit, OnDestroy {
    private readonly _chatSocketService = inject(ChatSocketService);
    private readonly _store = inject(Store);
    private readonly _ngZone = inject(NgZone);
    private readonly _cdRef = inject(ChangeDetectorRef)

    private readonly _destroy$ = new Subject<void>();

    private _prevScrollHeight: number = 0;
    private _preserveScroll: boolean = false;

    @ViewChild('messageScrollBox') messageScrollBox!: ElementRef<HTMLDivElement>;

    messages$!: Observable<IMessage[]>;
    chat$!: Observable<IChat>;
    currentUserId!: string;
    receiverId!: string;
    receiverType: UserType = 'customer';
    textMessage: string = '';
    isAllMessagesFetched = false;

    ngOnInit(): void {
        this.messages$ = this._store.select(selectSelectedChatsMessage).pipe(
            map(messages => (messages ?? []).filter(msg => !!msg)),
            takeUntil(this._destroy$),
        );

        this.messages$.subscribe(() => {
            setTimeout(() => {
                const el = this.messageScrollBox?.nativeElement;
                if (this._preserveScroll) {
                    const newScrollHeight = el.scrollHeight;
                    el.scrollTop = newScrollHeight - this._prevScrollHeight;
                } else {
                    this._scrollToBottom();
                }
            });
        });

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

    private _scrollToBottom(): void {
        this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                const el = this.messageScrollBox?.nativeElement;
                if (el) {
                    el.scrollTo({
                        top: el.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        })
    }

    onScroll() {
        const el = this.messageScrollBox?.nativeElement;
        if (el.scrollTop === 0) {
            this._store.select(selectIsAllMessagesFetched).pipe(take(1)).subscribe(isAllFetched => {
                if (isAllFetched) return;

                this.messages$.pipe(take(1)).subscribe(messages => {
                    if (messages.length > 0) {
                        const firstMessage = messages[0].id;
                        this.chat$.pipe(take(1)).subscribe(chat => {
                            this._store.dispatch(chatActions.fetchMessages({
                                chatId: chat.id,
                                beforeMessageId: firstMessage
                            }));
                        });

                        // Store scroll height before messages are added
                        this._prevScrollHeight = el.scrollHeight;
                        this._preserveScroll = true
                    }
                });
            });
        }
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

        setTimeout(() => this._scrollToBottom(), 100);
    }

}