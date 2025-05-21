import { Injectable } from "@angular/core";
import { debounceTime, distinctUntilChanged, Observable, Subject, switchMap } from "rxjs";

@Injectable()
export class DebounceService {
    private _searchSubject = new Subject<string>();

    /**
     * Push a new search value into the stream.
     * @param value - The current input value
     */
    public search(value: string): void {
        this._searchSubject.next(value);
    }

    /**
    * Returns an observable that emits debounced values.
    * @param delay - The debounce time in milliseconds
    * @returns Observable emitting the debounced value
    */
    onSearch(delay: number = 100): Observable<string> {
        return this._searchSubject.asObservable().pipe(
            debounceTime(delay),
            distinctUntilChanged(),
        );
    }
}