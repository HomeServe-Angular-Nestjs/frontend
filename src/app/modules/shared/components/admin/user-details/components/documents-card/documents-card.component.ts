import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IDocumentDetail, VerificationStatusType } from '../../../../../../../core/models/user-details.model';

@Component({
    selector: 'app-documents-card',
    standalone: true,
    host: { class: 'block' },
    imports: [CommonModule],
    templateUrl: './documents-card.component.html'
})
export class DocumentsCardComponent {
    @Input() documents: IDocumentDetail[] = [];

    statusPillClass(status: VerificationStatusType): string {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    }
}