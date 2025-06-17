import { Component, OnInit } from "@angular/core";
import { ChatService } from "../../../../../core/services/public/chat.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-chat",
    templateUrl: 'chat.component.html',
    imports: [CommonModule, FormsModule],
})
export class ChatComponent implements OnInit {
    message = '';
    messages: string[] = [];

    constructor(private chatService: ChatService) { }

    ngOnInit() {
        this.chatService.getMessage().subscribe((msg) => {
            this.messages.push(msg);
        });
    }

    send() {
        this.chatService.sendMessage(this.message);
        this.messages.push(this.message); // show your own message immediately
        this.message = '';
    }
}
