import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ChatListComponent } from "../../../shared/partials/shared/chat/chat-list-area/chat-list-area.component";
import { ChatMessageComponent } from "../../../shared/partials/shared/chat/chat-message-area/chat-message-area.component";
import { ChatSocketService } from "../../../../core/services/socket-service/chat.service";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { distinctUntilChanged, filter, map, Subject, takeUntil } from "rxjs";
import { Store } from "@ngrx/store";
import { chatActions } from "../../../../store/chat/chat.action";
import { CustomerHeaderComponent } from "../../../shared/partials/sections/customer/header/header.component";
import { selectCheckStatus } from "../../../../store/auth/auth.selector";

@Component({
    selector: 'app-customer-chat',
    templateUrl: './customer-chat.component.html',
    imports: [CommonModule, ChatListComponent, ChatMessageComponent, CustomerHeaderComponent]
})
export class CustomerChatComponent implements OnInit, OnDestroy {
    private readonly _store = inject(Store);
    private readonly _chatSocket = inject(ChatSocketService);

    private _destroy$ = new Subject<void>();


    ngOnInit(): void {
        this._store.select(selectCheckStatus).pipe(
            distinctUntilChanged(),
            takeUntil(this._destroy$)
        ).pipe(
            filter(status => status === 'authenticated')
        ).subscribe(() => {
            this._chatSocket.connect();
            this._store.dispatch(chatActions.fetchAllChat());
        });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}