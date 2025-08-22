import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    private readonly _loadingSource$ = new BehaviorSubject<boolean>(false);
    isLoading$ = this._loadingSource$.asObservable();
    text: string = '';

    get loading(): boolean {
        return this._loadingSource$.getValue();
    }

    show(text: string = 'Loading...') {
        this.text = text;
        this._loadingSource$.next(true);
    }

    hide() {
        this._loadingSource$.next(false);
    }
}
