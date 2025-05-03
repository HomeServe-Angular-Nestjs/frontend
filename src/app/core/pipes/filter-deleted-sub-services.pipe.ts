import { Pipe, PipeTransform } from "@angular/core";
import { IOfferedService } from "../models/offeredService.model";

@Pipe({ name: 'filterDeletedSubServices', pure: true })
export class FilterDeletedSubservicePipe implements PipeTransform {

    transform(services: IOfferedService[] | null | undefined = []): IOfferedService[] {
        if (!services) return [];
        
        return services.map(service => ({
            ...service,
            subService: service.subService.filter(sub => !sub.isDeleted)
        }));
    }
}
