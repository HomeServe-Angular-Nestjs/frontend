import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterModule,],
    templateUrl: './404.component.html',
    styleUrls: ['./404.component.scss']
})
export class NotFoundComponent implements OnInit {
    type: 'route' | 'data' = 'route';
    private _router = inject(Router)
    constructor() { }

    ngOnInit(): void {
        console.log('404 Page Rendered');
        const nav = this._router.getCurrentNavigation();
        this.type = nav?.extras.state?.['type'] || 'route';
    }

    goToHome() {

    }
}