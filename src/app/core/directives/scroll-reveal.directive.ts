import { AfterViewInit, Directive, ElementRef, inject, Input, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appScrollReveal]',
    standalone: true,
})
export class ScrollRevealDirective implements AfterViewInit {
    private readonly _el = inject(ElementRef<HTMLElement>);
    private readonly _renderer = inject(Renderer2);

    @Input() delay = 0;
    @Input() direction: 'up' | 'left' | 'right' | 'none' = 'up';

    ngAfterViewInit(): void {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const transform =
            this.direction === 'up' ? 'translateY(24px)'
                : this.direction === 'left' ? 'translateX(-24px)'
                : this.direction === 'right' ? 'translateX(24px)'
                : 'none';

        this._renderer.setStyle(this._el.nativeElement, 'opacity', '0');
        this._renderer.setStyle(this._el.nativeElement, 'transform', transform);
        this._renderer.setStyle(this._el.nativeElement, 'transition', `opacity 0.6s ease ${this.delay}ms, transform 0.6s ease ${this.delay}ms`);
        this._renderer.setStyle(this._el.nativeElement, 'will-change', 'opacity, transform');

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this._renderer.setStyle(this._el.nativeElement, 'opacity', '1');
                    this._renderer.setStyle(this._el.nativeElement, 'transform', 'none');
                    observer.disconnect();
                }
            });
        }, { threshold: 0.12 });

        observer.observe(this._el.nativeElement);
    }
}