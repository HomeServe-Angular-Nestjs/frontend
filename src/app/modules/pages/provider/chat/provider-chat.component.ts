import { Component } from "@angular/core";
import { ProviderChatListComponent } from "../../../shared/components/provider/chat/chat-list-area/chat-list-area.component";
import { ProviderChatMessageComponent } from "../../../shared/components/provider/chat/chat-message-area/chat-message-area.component";

@Component({
    selector: 'app-provider-chat',
    templateUrl: './provider-chat.component.html',
    imports: [ProviderChatListComponent, ProviderChatMessageComponent]
})
export class ProviderChatComponent { 

}