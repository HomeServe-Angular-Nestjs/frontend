import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'filterDeletedUser',
    pure: true
})
export class FilterDeletedUserPipe implements PipeTransform {
    transform(users: any[]): any[] {
        if (!users) return [];

        return users.filter(user => {
            const deleteAction = user.actions?.find((a: any) => a.action === 'delete');
            return !deleteAction || !deleteAction.value;
        });
    }
}