import { inject } from "@angular/core";
import { act, Actions, createEffect, ofType } from "@ngrx/effects";
import { chatActions } from "./chat.action";
import { catchError, map, switchMap } from "rxjs";
import { ChatSocketService } from "../../core/services/socket-service/chat.service";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { HttpErrorResponse } from "@angular/common/http";
import { ToastNotificationService } from "../../core/services/public/toastr.service";

export const chatEffects = {
    fetchAllChats$: createEffect(() => {
        const actions$ = inject(Actions);
        const chatService = inject(ChatSocketService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(chatActions.fetchAllChat),
            switchMap(() =>
                chatService.fetchAllChats().pipe(
                    map((response) => {
                        if (response.data) {
                            return chatActions.fetchAllChatSsuccess({ chats: response.data })
                        } else {
                            throw new Error('failed to fetch chats');
                        }
                    }),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, chatActions.fetchAllChatFailure, toastr);
                    })
                )
            )
        );
    }, { functional: true }),

    fetchAllMessages$: createEffect(() => {
        const actions$ = inject(Actions);
        const chatService = inject(ChatSocketService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(chatActions.fetchMessages),
            switchMap(({ chatId }) =>
                chatService.fetchAllMessages(chatId).pipe(
                    map((response) => {
                        if (response.success && response.data) {
                            return chatActions.fetchMessagesSuccess({ messages: response.data });
                        } else {
                            throw new Error('failed to fetch messages.');
                        }
                    }),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, chatActions.fetchMessagesFailure, toastr);
                    })
                )
            )
        );
    }, { functional: true })
}