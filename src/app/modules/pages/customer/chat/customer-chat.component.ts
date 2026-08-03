import { Component, computed, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ChatListComponent } from "../../../shared/partials/shared/chat/chat-list-area/chat-list-area.component";
import { ChatMessageComponent } from "../../../shared/partials/shared/chat/chat-message-area/chat-message-area.component";
import { ChatSocketService } from "../../../../core/services/socket-service/chat.service";
import { ChatPaneService } from "../../../../core/services/public/chat-pane.service";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { Store } from "@ngrx/store";
import { chatActions } from "../../../../store/chat/chat.action";
import { CustomerHeaderComponent } from "../../../shared/partials/sections/customer/header/header.component";
import { selectCheckStatus } from "../../../../store/auth/auth.selector";
import { selectSelectedChatId } from "../../../../store/chat/chat.selector";
import { VideoCallSocketService } from "../../../../core/services/socket-service/video-socket.service";

@Component({
  selector: 'app-customer-chat',
  templateUrl: './customer-chat.component.html',
  imports: [CommonModule, ChatListComponent, ChatMessageComponent, CustomerHeaderComponent]
})
export class CustomerChatComponent implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly _videoSocketService = inject(VideoCallSocketService);
  private readonly _chatSocket = inject(ChatSocketService);
  private readonly _chatPaneService = inject(ChatPaneService);

  private _destroy$ = new Subject<void>();
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

    this._store.select(selectCheckStatus).pipe(
      takeUntil(this._destroy$)
    ).subscribe((status) => {
      if (status === 'authenticated') {
        this._chatSocket.connect();
        this._videoSocketService.connect();
        this._store.dispatch(chatActions.fetchAllChat());
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._desktopQuery.removeEventListener('change', this._onViewportChange);
  }
}
