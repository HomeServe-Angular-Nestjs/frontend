import { Component } from '@angular/core';

@Component({
    selector: 'app-kpi-card-grid',
    standalone: true,
    template: `
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <ng-content></ng-content>
        </div>
    `,
})
export class KpiCardGridComponent { }