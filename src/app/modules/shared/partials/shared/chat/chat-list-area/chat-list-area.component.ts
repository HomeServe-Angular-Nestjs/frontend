import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { selectAllChats, selectSelectedChatId } from "../../../../../../store/chat/chat.selector";
import { chatActions } from "../../../../../../store/chat/chat.action";
import { filter, map, Observable, Subject, takeUntil } from "rxjs";
import { ChatSocketService } from "../../../../../../core/services/socket-service/chat.service";
import { IChat } from "../../../../../../core/models/chat.model";

@Component({
    selector: 'app-chat-list-area',
    templateUrl: './chat-list-area.component.html',
    imports: [CommonModule]
})
export class ChatListComponent implements OnInit, OnDestroy {
    private readonly _store = inject(Store);

    private _destroy$ = new Subject<void>();
    chats$!: Observable<IChat[]>

    ngOnInit(): void {
        this.chats$ = this._store.select(selectAllChats)
            .pipe(
                filter((chat) => !!chat),
                takeUntil(this._destroy$)
            );
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    getLastSeenAt(date: Date): string {
        const now = new Date();
        const myDate = new Date(date);

        const diffMs = now.getTime() - myDate.getTime();

        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays >= 1) {
            return myDate.toDateString();
        } else if (diffHours >= 1) {
            return '1 hour ago';
        } else if (diffMinutes >= 1) {
            return 'More than a minute ago';
        } else {
            return 'Just now';
        }
    }

    viewMessages(chatId: string) {
        this.chats$ = this.chats$.pipe(
            map(chats => chats.map(chat => ({
                ...chat,
                totalMessages: chat.id === chatId ? 0 : chat.unreadMessages
            })))
        );
        this._store.dispatch(chatActions.selectChat({ chatId }));
        this._store.dispatch(chatActions.fetchMessages({ chatId }));
    }

    imageHandler(url?: string): string {
        return url ? url : 'assets/images/profile_placeholder.jpg';
    }

    onImgError(event: Event) {
        const target = event.target as HTMLImageElement;
        target.src = 'assets/images/profile_placeholder.jpg';
    }

    hasUnReadMessages() {
    }
}
