import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    selector: 'app-provider-chat-list-area',
    templateUrl: './chat-list-area.component.html',
    imports: [CommonModule]
})
export class ProviderChatListComponent {
    chats = [
        { name: 'Alice', message: 'Need help with booking...', time: '9:45 AM', unread: 2 },
        { name: 'Mark', message: 'Thank you!', time: '9:30 AM', unread: 0 },
    ];
}
