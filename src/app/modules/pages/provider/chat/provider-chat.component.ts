import { Component, computed, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ChatListComponent } from "../../../shared/partials/shared/chat/chat-list-area/chat-list-area.component";
import { ChatMessageComponent } from "../../../shared/partials/shared/chat/chat-message-area/chat-message-area.component";
import { ChatPaneService } from "../../../../core/services/public/chat-pane.service";
import { CommonModule } from "@angular/common";
import { Store } from "@ngrx/store";
import { chatActions } from "../../../../store/chat/chat.action";
import { selectSelectedChatId } from "../../../../store/chat/chat.selector";
import { VideoCallSocketService } from "../../../../core/services/socket-service/video-socket.service";

@Component({
  selector: 'app-provider-chat',
  templateUrl: './provider-chat.component.html',
  imports: [CommonModule, ChatListComponent, ChatMessageComponent]
})
export class ProviderChatComponent implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly _videoSocketService = inject(VideoCallSocketService);
  private readonly _chatPaneService = inject(ChatPaneService);

  private readonly _isDesktop = signal(false);
  private _desktopQuery = window.matchMedia('(min-width: 1024px)');

  private readonly _selectedChatId = toSignal(
    this._store.select(selectSelectedChatId),
    { initialValue: null }
  );

  readonly listClass = computed(() => ({
    'hidden': !this._isDesktop() && !!this._selectedChatId(),
    'lg:hidden': this._isDesktop() && this._chatPaneService.isListCollapsed(),
  }));

  readonly messagesClass = computed(() => ({
    'hidden': !this._isDesktop() && !this._selectedChatId(),
  }));

  private readonly _onViewportChange = (event: MediaQueryListEvent) => {
    this._isDesktop.set(event.matches);
  };

  ngOnInit(): void {
    this._isDesktop.set(this._desktopQuery.matches);
    this._desktopQuery.addEventListener('change', this._onViewportChange);

    this._videoSocketService.connect();
    this._store.dispatch(chatActions.fetchAllChat());
  }

  ngOnDestroy(): void {
    this._desktopQuery.removeEventListener('change', this._onViewportChange);
  }
}
