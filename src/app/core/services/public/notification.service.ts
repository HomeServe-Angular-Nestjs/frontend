// notification.service.ts
import { Injectable } from '@angular/core';
import { Notyf } from 'notyf';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private notyf = new Notyf({
        duration: 4000,
        position: { x: 'right', y: 'top' },
        ripple: false, // Disable ripple effect to remove Material dependency
        types: [
            {
                type: 'success',
                background: '#FFF3F3',
                className: 'notyf-success',
                dismissible: false,
                icon: {
                    className: 'notyf-icon-success',
                    tagName: 'div',
                    text: '✓'
                }
            },
            {
                type: 'error',
                background: '#FFF3F3',
                className: 'notyf-error',
                dismissible: false,
                icon: {
                    className: 'notyf-icon-error',
                    tagName: 'div',
                    text: '⚠️'
                }
            }
        ]
    });

    success(message: string) {
        this.notyf.success(message);
    }

    error(message: string) {
        this.notyf.error(message);
    }
}