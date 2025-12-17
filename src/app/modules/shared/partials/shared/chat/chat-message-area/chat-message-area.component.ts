import { CommonModule } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, Injector, NgZone, OnDestroy, OnInit, QueryList, signal, ViewChild, ViewChildren } from "@angular/core";
import { ChatSocketService } from "../../../../../../core/services/socket-service/chat.service";
import { FormsModule } from "@angular/forms";
import { delay, filter, map, Observable, Subject, take, takeUntil, tap } from "rxjs";
import { Store } from "@ngrx/store";
import { IChat, IMessage, ISendMessage } from "../../../../../../core/models/chat.model";
import { selectIsAllMessagesFetched, selectSelectedChat, selectSelectedChatsMessage } from "../../../../../../store/chat/chat.selector";
import { UserType } from "../../../../models/user.model";
import { selectAuthUserId } from "../../../../../../store/auth/auth.selector";
import { chatActions } from "../../../../../../store/chat/chat.action";
import { LoadingCircleAnimationComponent } from "../../loading-Animations/loading-circle/loading-circle.component";
import { VideoCallService } from "../../../../../../core/services/video-call.service";
import { BookingService } from "../../../../../../core/services/booking.service";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";

@Component({
  selector: 'app-chat-message-area',
  templateUrl: './chat-message-area.component.html',
  imports: [CommonModule, FormsModule, LoadingCircleAnimationComponent],
})
export class ChatMessageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly _chatSocketService = inject(ChatSocketService);
  private readonly _videoCallService = inject(VideoCallService);
  private readonly _cdRef = inject(ChangeDetectorRef);
  private readonly _bookingService = inject(BookingService);
  private _toastr = inject(ToastNotificationService);

  private readonly _ngZone = inject(NgZone);
  private readonly _store = inject(Store);

  private readonly _destroy$ = new Subject<void>();

  // Preserves scrolling when older messages are prepended
  private _prevScrollHeight = 0;
  private _prevScrollTop = 0;
  private _preserveScroll = false;

  // State flags
  isLoading = signal(true);
  private _initialAutoScrollDone = false;
  private _isFetching = false;

  @ViewChild('messageScrollBox', { static: false })
  messageScrollBox!: ElementRef<HTMLDivElement>;
  @ViewChildren('messageItem')
  messageItems!: QueryList<ElementRef>;

  messages$!: Observable<IMessage[]>;
  chat$!: Observable<IChat>;
  currentUserId!: string;
  receiverId!: string;
  receiverType: UserType = 'customer';
  textMessage: string = '';
  isAllMessagesFetched = false;

  ngOnInit(): void {
    this.messages$ = this._store.select(selectSelectedChatsMessage).pipe(
      delay(800),
      map(messages => (messages ?? []).filter(msg => !!msg)),
      tap(() => this.isLoading.set(false)),
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
          this._initialAutoScrollDone = true;
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
    if (!el || this._isFetching) return;

    const pixelThreshold = 60;
    if (el.scrollTop <= pixelThreshold) {
      this._isFetching = true;

      // Get first visible message before fetching
      const firstVisible = this.messageItems.find(item => {
        const rect = item.nativeElement.getBoundingClientRect();
        return rect.top >= 0; // first item in view
      });

      const firstMessageId = firstVisible?.nativeElement.dataset?.messageId;

      this._store.select(selectIsAllMessagesFetched).pipe(take(1)).subscribe(isAllFetched => {
        if (isAllFetched) {
          this._isFetching = false;
          return;
        }

        this.chat$.pipe(take(1)).subscribe(chat => {
          this._store.dispatch(chatActions.fetchMessages({
            chatId: chat.id,
            beforeMessageId: firstMessageId
          }));
        });

        // Delay scroll restore until after messages$ updates
        this.messages$.pipe(take(1)).subscribe(() => {
          if (firstMessageId) {
            const elFirst = this.messageItems.find(
              item => item.nativeElement.dataset?.messageId === firstMessageId
            );
            if (elFirst) {
              el.scrollTop = elFirst.nativeElement.offsetTop;
            }
          }
          this._isFetching = false;
        });
      });
    }
  }

  sendMessage() {
    const trimmedMessage = this.textMessage.trim();
    if (!trimmedMessage) return;

    const msgContent: ISendMessage = {
      message: trimmedMessage,
      receiverId: this.receiverId,
      type: this.receiverType
    };

    this._chatSocketService.sendMessage(msgContent);
    this.textMessage = '';

    this._afterDOMPaint(() => this._scrollToBottomSmooth());
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
      alert('Customer')
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
}
