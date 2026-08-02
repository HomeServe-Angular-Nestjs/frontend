import { Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IBreadcrumb, IBreadcrumbParent } from '../../models/breadcrumb.model';

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
            const routeUrl = parentUrl.concat(route.url.map(url => url.path));
            const queryString = this.buildQueryString(route.queryParams);

            const parent = route.data['breadcrumbParent'] as IBreadcrumbParent | undefined;
            if (parent) {
                breadcrumbs.push({
                    label: parent.label,
                    url: parent.path + queryString
                });
            }

            if (route.data['breadcrumb']) {
                const breadcrumb: IBreadcrumb = {
                    label: this.getLabel(route.data['breadcrumb'], route),
                    url: '/' + routeUrl.join('/') + queryString
                };
                breadcrumbs.push(breadcrumb);
            }

            this.addBreadcrumb(route.firstChild!, routeUrl, breadcrumbs);
        }
    }

    private buildQueryString(queryParams: Record<string, any>): string {
        const params = Object.entries(queryParams ?? {})
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        return params.length ? '?' + params.join('&') : '';
    }

    private getLabel(breadcrumb: any, route: ActivatedRouteSnapshot): string {
        return typeof breadcrumb === 'function' ? breadcrumb(route.data) : breadcrumb;
    }
}
