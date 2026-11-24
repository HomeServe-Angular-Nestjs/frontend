import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Router } from '@angular/router';

export type PageScrollBehavior = 'instant' | 'smooth';
export type PageScrollRouteBehavior = 'top' | 'preserve' | 'restore' | 'disabled';

const PAGE_SCROLL_ROUTE_DATA_KEY = 'pageScroll';

@Injectable({ providedIn: 'root' })
export class PageScrollService {
  private readonly _document = inject(DOCUMENT);
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _router = inject(Router);

  private readonly _positions = new Map<string, number>();
  private _currentUrl = this._router.url;
  private _isPopstateNavigation = false;
  private _automaticScrollingEnabled = true;
  private _navigationVersion = 0;

  constructor() {
    const view = this._document.defaultView;
    const previousScrollRestoration = view?.history.scrollRestoration;

    if (view) {
      view.history.scrollRestoration = 'manual';
      this._destroyRef.onDestroy(() => {
        if (previousScrollRestoration) {
          view.history.scrollRestoration = previousScrollRestoration;
        }
      });
    }

    this._router.events
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.savePagePosition(this._currentUrl);
          this._isPopstateNavigation = event.navigationTrigger === 'popstate';
          return;
        }

        if (event instanceof NavigationEnd) {
          this._handleNavigationEnd(event.urlAfterRedirects);
        }
      });
  }

  setAutomaticScrollingEnabled(enabled: boolean): void {
    this._automaticScrollingEnabled = enabled;
  }

  scrollToTop(behavior: PageScrollBehavior = 'instant'): void {
    this.scrollToPosition(0, behavior);
  }

  scrollToPosition(position: number, behavior: PageScrollBehavior = 'instant'): void {
    if (!Number.isFinite(position)) {
      throw new RangeError('Page scroll position must be a finite number.');
    }

    const view = this._document.defaultView;
    if (!view) return;

    const top = Math.max(0, position);
    if (behavior === 'smooth') {
      view.scrollTo({ top, behavior: 'smooth' });
    } else {
      view.scrollTo(0, top);
    }
  }

  scrollToElement(
    target: string | Element,
    behavior: PageScrollBehavior = 'instant',
    offset = 0,
  ): boolean {
    const element = typeof target === 'string' ? this._document.getElementById(target) : target;
    if (!element) return false;

    const position = element.getBoundingClientRect().top + this._getCurrentPosition() - offset;
    this.scrollToPosition(position, behavior);
    return true;
  }

  scrollToElementAfterNextRender(
    target: string | Element,
    behavior: PageScrollBehavior = 'instant',
    offset = 0,
  ): void {
    afterNextRender(
      () => this.scrollToElement(target, behavior, offset),
      { injector: this._injector },
    );
  }

  savePagePosition(key = this._currentUrl): void {
    this._positions.set(key, this._getCurrentPosition());
  }

  restorePagePosition(
    key = this._currentUrl,
    behavior: PageScrollBehavior = 'instant',
  ): boolean {
    const position = this._positions.get(key);
    if (position === undefined) return false;

    this.scrollToPosition(position, behavior);
    return true;
  }

  private _handleNavigationEnd(url: string): void {
    this._currentUrl = url;

    if (!this._automaticScrollingEnabled) return;

    const routeBehavior = this._getRouteBehavior();
    if (routeBehavior === 'disabled') return;

    let behavior: PageScrollRouteBehavior =
      routeBehavior ?? (this._isPopstateNavigation ? 'restore' : 'top');

    if (behavior === 'preserve') {
      if (!this._isPopstateNavigation) return;
      behavior = 'restore';
    }

    const navigationVersion = ++this._navigationVersion;
    afterNextRender(() => {
      if (!this._automaticScrollingEnabled || navigationVersion !== this._navigationVersion) return;

      if (behavior === 'top') {
        this.scrollToTop();
      } else if (!this.restorePagePosition(url)) {
        this.scrollToTop();
      }
    }, { injector: this._injector });
  }

  private _getRouteBehavior(): PageScrollRouteBehavior | undefined {
    let route: ActivatedRouteSnapshot | null = this._router.routerState.snapshot.root;
    let behavior: PageScrollRouteBehavior | undefined;

    while (route) {
      const configuredBehavior = route.routeConfig?.data?.[PAGE_SCROLL_ROUTE_DATA_KEY];
      if (this._isRouteBehavior(configuredBehavior)) {
        behavior = configuredBehavior;
      }
      route = route.firstChild;
    }

    return behavior;
  }

  private _isRouteBehavior(value: unknown): value is PageScrollRouteBehavior {
    return value === 'top' || value === 'preserve' || value === 'restore' || value === 'disabled';
  }

  private _getCurrentPosition(): number {
    const view = this._document.defaultView;
    return view?.scrollY ?? this._document.scrollingElement?.scrollTop ?? 0;
  }
}
