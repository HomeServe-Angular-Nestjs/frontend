import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IDocumentDetail } from '../../../../../../../core/models/user-details.model';

@Component({
    selector: 'app-documents-card',
    standalone: true,
    host: { class: 'block' },
    imports: [CommonModule],
    templateUrl: './documents-card.component.html'
})
export class DocumentsCardComponent {
    @Input() documents: IDocumentDetail[] = [];
}