import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Store } from "@ngrx/store";
import { selectAllChats } from "../../../../../../store/chat/chat.selector";
import { chatActions } from "../../../../../../store/chat/chat.action";
import { BehaviorSubject, combineLatest, filter, map, Observable, Subject, takeUntil } from "rxjs";
import { IChat } from "../../../../../../core/models/chat.model";
import { ChatSocketService } from "../../../../../../core/services/socket-service/chat.service";

@Component({
    selector: 'app-chat-list-area',
    templateUrl: './chat-list-area.component.html',
    imports: [CommonModule, FormsModule]
})
export class ChatListComponent implements OnInit, OnDestroy {
    private readonly _store = inject(Store);
    private readonly _chatSocketService = inject(ChatSocketService);

    private _destroy$ = new Subject<void>();
    private _searchTerm$ = new BehaviorSubject<string>('');
    searchTerm = '';
    chats$!: Observable<IChat[]>

    ngOnInit(): void {
        this.chats$ = combineLatest([
            this._store.select(selectAllChats).pipe(filter((chat) => !!chat)),
            this._searchTerm$,
        ]).pipe(
            map(([chats, term]) =>
                term
                    ? chats.filter(c => c.receiver.name.toLowerCase().includes(term.toLowerCase()))
                    : chats
            ),
            takeUntil(this._destroy$)
        );
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onSearchChange(value: string) {
        this.searchTerm = value;
        this._searchTerm$.next(value);
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
            return `${diffHours}h ago`;
        } else if (diffMinutes >= 1) {
            return `${diffMinutes}m ago`;
        } else {
            return 'Just now';
        }
    }

    viewMessages(chatId: string, receiverId: string) {
        this._store.dispatch(chatActions.selectChat({ chatId }));
        this._store.dispatch(chatActions.fetchMessages({ chatId, receiverId }));
        this._chatSocketService.markMessagesRead(chatId);
    }

    imageHandler(url?: string): string {
        return url ? url : 'assets/images/profile_placeholder.jpg';
    }

    onImgError(event: Event) {
        const target = event.target as HTMLImageElement;
        target.src = 'assets/images/profile_placeholder.jpg';
    }
}
