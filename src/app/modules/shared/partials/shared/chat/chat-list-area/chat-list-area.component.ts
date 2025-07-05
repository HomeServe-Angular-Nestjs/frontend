import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { selectAllChats } from "../../../../../../store/chat/chat.selector";
import { chatActions } from "../../../../../../store/chat/chat.action";
import { filter, Subject, takeUntil } from "rxjs";
import { ChatSocketService } from "../../../../../../core/services/socket-service/chat.service";

@Component({
    selector: 'app-chat-list-area',
    templateUrl: './chat-list-area.component.html',
    imports: [CommonModule]
})
export class ChatListComponent implements OnInit, OnDestroy {
    private readonly _store = inject(Store);
    private readonly _chatService = inject(ChatSocketService);

    chats$ = this._chatService._chats$;

    private _destroy$ = new Subject<void>();

    ngOnInit(): void {
        this._store.select(selectAllChats)
            .pipe(
                filter((chat) => !!chat),
                takeUntil(this._destroy$)
            ).subscribe(chats => {
                console.log(chats);
                this._chatService.setChats(chats)
            });
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
}
