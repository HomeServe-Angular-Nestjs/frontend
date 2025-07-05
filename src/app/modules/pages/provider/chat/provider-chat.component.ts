import { Component, inject, OnInit } from "@angular/core";
import { ChatListComponent } from "../../../shared/partials/shared/chat/chat-list-area/chat-list-area.component";
import { ChatMessageComponent } from "../../../shared/partials/shared/chat/chat-message-area/chat-message-area.component";
import { Store } from "@ngrx/store";
import { chatActions } from "../../../../store/chat/chat.action";

@Component({
    selector: 'app-provider-chat',
    templateUrl: './provider-chat.component.html',
    imports: [ChatListComponent, ChatMessageComponent]
})
export class ProviderChatComponent implements OnInit {
    private readonly _store = inject(Store);

    ngOnInit(): void {
        this._store.dispatch(chatActions.fetchAllChat());
    }
}