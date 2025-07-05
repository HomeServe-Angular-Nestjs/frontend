import { Component, inject, OnInit } from "@angular/core";
import { ChatListComponent } from "../../../shared/partials/shared/chat/chat-list-area/chat-list-area.component";
import { ChatMessageComponent } from "../../../shared/partials/shared/chat/chat-message-area/chat-message-area.component";
import { ChatSocketService } from "../../../../core/services/socket-service/chat.service";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { filter, map } from "rxjs";
import { Store } from "@ngrx/store";
import { chatActions } from "../../../../store/chat/chat.action";
import { CustomerHeaderComponent } from "../../../shared/partials/sections/customer/header/header.component";

@Component({
    selector: 'app-customer-chat',
    templateUrl: './customer-chat.component.html',
    imports: [CommonModule, ChatListComponent, ChatMessageComponent, CustomerHeaderComponent]
})
export class CustomerChatComponent implements OnInit {
    private readonly _store = inject(Store);

    ngOnInit(): void {
        this._store.dispatch(chatActions.fetchAllChat());
    }

}