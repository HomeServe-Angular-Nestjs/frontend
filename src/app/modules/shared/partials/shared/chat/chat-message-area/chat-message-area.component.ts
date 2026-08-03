import { CommonModule } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, NgZone, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ChatSocketService } from "../../../../../../core/services/socket-service/chat.service";
import { FormsModule } from "@angular/forms";
import { distinctUntilChanged, filter, map, Observable, Subject, take, takeUntil } from "rxjs";
import { Store } from "@ngrx/store";
import { IChat, IMessage, ISendMessage } from "../../../../../../core/models/chat.model";
import { selectHasMoreMessages, selectIsLoadingMessages, selectMessagesError, selectNextCursor, selectSelectedChat, selectSelectedChatsMessage } from "../../../../../../store/chat/chat.selector";
import { UserType } from "../../../../models/user.model";
import { selectAuthUserId } from "../../../../../../store/auth/auth.selector";
import { chatActions } from "../../../../../../store/chat/chat.action";
import { VideoCallService } from "../../../../../../core/services/video-call.service";
import { BookingService } from "../../../../../../core/services/booking.service";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { ChatPaneService } from "../../../../../../core/services/public/chat-pane.service";

const MESSAGE_PAGE_SIZE = 20;

@Component({
  selector: 'app-chat-message-area',
  templateUrl: './chat-message-area.component.html',
  imports: [CommonModule, FormsModule],
})
export class ChatMessageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly _chatSocketService = inject(ChatSocketService);
  private readonly _videoCallService = inject(VideoCallService);
  private readonly _cdRef = inject(ChangeDetectorRef);
  private readonly _bookingService = inject(BookingService);
  private _toastr = inject(ToastNotificationService);
  private readonly _chatPaneService = inject(ChatPaneService);

  private readonly _ngZone = inject(NgZone);
  private readonly _store = inject(Store);

  private readonly _destroy$ = new Subject<void>();

  // Preserves scrolling when older messages are prepended
  private _prevScrollHeight = 0;
  private _prevScrollTop = 0;
  private _preserveScroll = false;

  // State flags
  private _isFetching = false;
  private hasMoreMessages = false;
  private nextCursor: string | null = null;

  @ViewChild('messageScrollBox', { static: false })
  messageScrollBox!: ElementRef<HTMLDivElement>;

  messages$!: Observable<IMessage[]>;
  chat$!: Observable<IChat>;
  isLoadingMessages$!: Observable<boolean>;
  messagesError$!: Observable<any>;
  currentUserId!: string;
  receiverId!: string;
  receiverType: UserType = 'customer';
  textMessage: string = '';

  ngOnInit(): void {
    this.isLoadingMessages$ = this._store.select(selectIsLoadingMessages);
    this.messagesError$ = this._store.select(selectMessagesError);

    this.messages$ = this._store.select(selectSelectedChatsMessage).pipe(
      map(messages => (messages ?? []).filter(msg => !!msg)),
      takeUntil(this._destroy$),
    );

    this.messages$.subscribe((messages) => {
      this._afterDOMPaint(() => {
        const el = this.messageScrollBox?.nativeElement;
        if (!el) return;

        if (this._preserveScroll) {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = this._prevScrollTop + (newScrollHeight - this._prevScrollHeight);
          this._preserveScroll = false;
          return;
        }

        if (!this._isEmpty(messages)) {
          this._scrollToBottomImmediate();
          return;
        }

        if (this._isNear(el, 80)) {
          this._scrollToBottomSmooth();
        }
      });
    });

    this.chat$ = this._store.select(selectSelectedChat).pipe(
      filter(chat => !!chat),
      takeUntil(this._destroy$)
    );

    this._store.select(selectAuthUserId)
      .pipe(takeUntil(this._destroy$))
      .subscribe(id => { if (id) this.currentUserId = id; });

    this.chat$.subscribe(chat => {
      const receiver = chat.receiver;
      if (receiver) {
        this.receiverId = receiver.id;
        this.receiverType = receiver.type;
      }
    });

    this._store.select(selectHasMoreMessages)
      .pipe(takeUntil(this._destroy$))
      .subscribe(hasMore => this.hasMoreMessages = hasMore);

    this._store.select(selectNextCursor)
      .pipe(takeUntil(this._destroy$))
      .subscribe(cursor => this.nextCursor = cursor);

    this.isLoadingMessages$
      .pipe(takeUntil(this._destroy$))
      .subscribe(loading => { if (!loading) this._isFetching = false; });

    this._store.select(selectSelectedChat).pipe(
      filter(chat => !!chat && !!chat.receiver?.id),
      map(chat => ({ chatId: chat!.id, receiverId: chat!.receiver.id })),
      distinctUntilChanged((a, b) => a.chatId === b.chatId && a.receiverId === b.receiverId),
      takeUntil(this._destroy$)
    ).subscribe(({ chatId, receiverId }) => {
      this._store.dispatch(chatActions.fetchMessages({ chatId, receiverId, limit: MESSAGE_PAGE_SIZE }));
    });
  }

  ngAfterViewInit(): void {
    // ensures I am in the bottom after the view is ready (first time).
    this._afterDOMPaint(() => this._scrollToBottomImmediate());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // Runs the fn after angular finishes the current change detection.
  // and after the DOM is painted.
  private _afterDOMPaint(fn: () => void): void {
    this._cdRef.detectChanges();
    this._ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => fn());
      });
    });
  }

  private _isEmpty<T>(arr?: T[]): arr is [] {
    return !arr || arr.length === 0;
  }

  private _scrollToBottomImmediate(): void {
    const el = this.messageScrollBox?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  private _isNear = (el: HTMLElement, px = 800): boolean => {
    const distanceFRomBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFRomBottom <= px;
  }

  private _scrollToBottomSmooth(): void {
    const el = this.messageScrollBox?.nativeElement;
    if (!el) return;
    this._ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      })
    });
  }

  onScroll() {
    const el = this.messageScrollBox?.nativeElement;
    if (!el || this._isFetching || !this.hasMoreMessages || !this.nextCursor) return;

    const pixelThreshold = 60;
    if (el.scrollTop <= pixelThreshold) {
      this._isFetching = true;
      this._preserveScroll = true;
      this._prevScrollTop = el.scrollTop;
      this._prevScrollHeight = el.scrollHeight;

      this.chat$.pipe(take(1)).subscribe(chat => {
        this._store.dispatch(chatActions.fetchMessages({
          chatId: chat.id,
          receiverId: this.receiverId,
          beforeMessageId: this.nextCursor!,
          limit: MESSAGE_PAGE_SIZE
        }));
      });
    }
  }

  private _generateClientMessageId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  sendMessage() {
    const trimmedMessage = this.textMessage.trim();
    if (!trimmedMessage) return;

    const clientMessageId = this._generateClientMessageId();

    this.chat$.pipe(take(1)).subscribe(chat => {
      const pendingMessage: IMessage = {
        id: clientMessageId,
        chatId: chat.id,
        senderId: this.currentUserId,
        receiverId: this.receiverId,
        content: trimmedMessage,
        messageType: 'text',
        isRead: false,
        isDeleted: false,
        clientMessageId,
        isPending: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this._store.dispatch(chatActions.addPendingMessage({ message: pendingMessage }));

      const msgContent: ISendMessage = {
        message: trimmedMessage,
        receiverId: this.receiverId,
        type: this.receiverType,
        clientMessageId,
      };

      this._chatSocketService.sendMessage(msgContent);
    });

    this.textMessage = '';
    this._afterDOMPaint(() => this._scrollToBottomSmooth());
  }

  toggleChatList(): void {
    this._chatPaneService.toggleList();
  }

  goBackToList(): void {
    this._store.dispatch(chatActions.clearSelectedChat());
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/profile_placeholder.jpg';
  }

  startVideoCall() {
    if (!this.receiverId) return;
    if (this.receiverType === 'provider') {
      this._bookingService.canCustomerStartCall(this.receiverId)
        .pipe(takeUntil(this._destroy$))
        .subscribe(res => {
          if (res.success) {
            this._videoCallService.startCall(this.receiverId);
          } else {
            this._toastr.error(res.message);
          }
        });
    } else if (this.receiverType === 'customer') {
      this._bookingService.canProviderStartCall(this.receiverId)
        .pipe(takeUntil(this._destroy$))
        .subscribe(res => {
          if (res.success) {
            this._videoCallService.startCall(this.receiverId);
          } else {
            this._toastr.error(res.message);
          }
        });
    }
  }

  tryAgain() {
    this.chat$.pipe(take(1)).subscribe(chat => {
      if (chat?.id) {
        this._store.dispatch(chatActions.fetchMessages({
          chatId: chat.id,
          receiverId: this.receiverId,
          limit: MESSAGE_PAGE_SIZE
        }));
      }
    });
  }
}