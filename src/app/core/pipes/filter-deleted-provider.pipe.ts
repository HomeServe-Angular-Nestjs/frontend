import { Pipe, PipeTransform } from "@angular/core";
import { IProvider } from "../models/user.model";

@Pipe({ name: 'filterDeletedProviders', pure: true })
export class FilterDeletedProvidePipe implements PipeTransform {
    transform(providers: IProvider[]): IProvider[] {
        if (providers.length <= 0) {
            return [];
        }

        return providers.filter(provider => !provider.isDeleted);
    }
}