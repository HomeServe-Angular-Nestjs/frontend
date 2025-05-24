import { Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { selectSavedProviders } from '../../store/customer/customer.selector';

/**
 * @description
 * Pure Angular pipe to check if a given provider ID is marked as "saved"
 * by the current user. This pipe leverages NgRx state management to observe
 * the list of saved provider IDs and returns a reactive boolean Observable.
 *
 * This pipe is pure and designed to work efficiently with Angular's
 * change detection mechanism in combination with the `async` pipe.
 *
 */
@Pipe({
    name: 'isSaved',
    pure: true
})
export class IsSavedPipe implements PipeTransform {
 
    constructor(private _store: Store) { }

    /**
     * Transforms a provider ID into a reactive boolean observable indicating
     * whether the ID exists in the list of saved providers.
     *
     * @param providerId - The unique identifier of the provider.
     * @returns An Observable<boolean> which emits `true` if the provider is saved, otherwise `false`.
     */
    transform(providerId: string): Observable<boolean> {
        console.log(providerId)
        return this._store.select(selectSavedProviders).pipe(
            map((saved: string[]) => saved?.includes(providerId) ?? false)
        );
    }
}
