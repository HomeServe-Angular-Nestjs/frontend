import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnDestroy, OnInit } from "@angular/core";
import { Router, Scroll } from "@angular/router";
import { filter, Subject, takeUntil } from "rxjs";
import { PageScrollService } from "../../../../../../core/services/public/page-scroll.service";

@Component({
    selector: 'app-customer-provider-profile-nav',
    templateUrl: 'customer-provider-profile-nav.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class CustomerProviderProfileNavigationComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    private readonly _pageScrollService = inject(PageScrollService);

    private readonly _destroy$ = new Subject<void>();
    private _restoreScrollTo = -1;

    @Input({ required: true }) providerId!: string | null;

    items = [
        {
            name: 'About',
            route: 'about',
            active: false
        },
        {
            name: 'Services',
            route: 'services',
            active: false
        },
        {
            name: 'Reviews',
            route: 'reviews',
            active: false
        },
        {
            name: 'Gallery',
            route: 'gallery',
            active: false
        },
    ];

    ngOnInit(): void {
        const currentTab = this.router.url.split('/').pop()?.split('?')[0];

        this.items = this.items.map((item) => ({
            ...item,
            active: item.route === currentTab
        }));

        this.router.events.pipe(
            filter((event): event is Scroll => event instanceof Scroll),
            takeUntil(this._destroy$)
        ).subscribe((event: Scroll) => {
            if (event.position === null) {
                this._pageScrollService.scrollToElement('#provider-details-nav', 'smooth');
            }
        });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    changHover(index: number): void {
        this.items = this.items.map((item, i) => ({
            ...item,
            active: i === index
        }));
        this._restoreScrollTo = window.scrollY;
        this.router.navigate(['provider_details', this.providerId, this.items[index].route]);
    }

}