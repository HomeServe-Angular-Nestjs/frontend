import { inject, Injectable } from "@angular/core";
import { MESSAGES_ENV } from "../../../environments/messages.environments";
import { NotificationService } from "../../../core/services/public/notification.service";
import { AbstractControl } from "@angular/forms";

@Injectable({ providedIn: "root" })
export class ValidateForm {
    private notyf = inject(NotificationService);

    messages = MESSAGES_ENV;

    hasValidationErrors(control: AbstractControl | null, fieldName: string): boolean {
        console.log(control?.errors)
        if (control?.errors) {
            Object.keys(control.errors).forEach((key) => {
                console.log(key)
                if (this.messages[fieldName]?.[key]) {
                    this.notyf.error(this.messages['errorMessages'][fieldName][key]);
                }
            });
            return true;
        }
        return false;
    }
}