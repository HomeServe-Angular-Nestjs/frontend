import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ChatPaneService {
    private readonly _isListCollapsed = signal(false);
    readonly isListCollapsed = this._isListCollapsed.asReadonly();

    toggleList(): void {
        this._isListCollapsed.update(collapsed => !collapsed);
    }
}
