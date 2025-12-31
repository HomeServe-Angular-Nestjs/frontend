import { Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IBreadcrumb } from '../../models/breadcrumb.model';

@Injectable({
    providedIn: 'root'
})
export class BreadcrumbService {
    private readonly _breadcrumbs = signal<IBreadcrumb[]>([]);
    public readonly breadcrumbs = this._breadcrumbs.asReadonly();

    constructor(private router: Router) {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.updateBreadcrumbs();
        });

        // Handle initial load
        setTimeout(() => this.updateBreadcrumbs(), 0);
    }

    private updateBreadcrumbs() {
        const root = this.router.routerState.snapshot.root;
        const breadcrumbs: IBreadcrumb[] = [];
        this.addBreadcrumb(root, [], breadcrumbs);
        this._breadcrumbs.set(breadcrumbs);
    }

    private addBreadcrumb(route: ActivatedRouteSnapshot, parentUrl: string[], breadcrumbs: IBreadcrumb[]) {
        if (route) {
            // Construct the route URL
            const routeUrl = parentUrl.concat(route.url.map(url => url.path));

            // Add breadcrumb if it has a label
            if (route.data['breadcrumb']) {
                const breadcrumb: IBreadcrumb = {
                    label: this.getLabel(route.data['breadcrumb'], route),
                    url: '/' + routeUrl.join('/')
                };
                breadcrumbs.push(breadcrumb);
            }

            // Add child breadcrumbs recursively
            this.addBreadcrumb(route.firstChild!, routeUrl, breadcrumbs);
        }
    }

    private getLabel(breadcrumb: any, route: ActivatedRouteSnapshot): string {
        return typeof breadcrumb === 'function' ? breadcrumb(route.data) : breadcrumb;
    }
}
