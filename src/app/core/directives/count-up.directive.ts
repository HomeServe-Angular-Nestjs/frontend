import { AfterViewInit, Directive, ElementRef, inject, Input, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appCountUp]',
    standalone: true,
})
export class CountUpDirective implements AfterViewInit {
    private readonly _el = inject(ElementRef<HTMLElement>);
    private readonly _renderer = inject(Renderer2);

    @Input() target = 0;
    @Input() duration = 1600;
    @Input() decimals = 0;
    @Input() prefix = '';
    @Input() suffix = '';
    @Input() animateOnInit = false;

    ngAfterViewInit(): void {
        this._renderer.setProperty(this._el.nativeElement, 'textContent', this._format(0));

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const run = () => this._animate();

        if (this.animateOnInit || prefersReducedMotion) {
            if (prefersReducedMotion) {
                this._renderer.setProperty(this._el.nativeElement, 'textContent', this._format(this.target));
                return;
            }
            run();
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    run();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.4 });
        observer.observe(this._el.nativeElement);
    }

    private _animate(): void {
        const start = performance.now();
        const step = (now: number) => {
            const progress = Math.min((now - start) / this.duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = this.target * eased;
            this._renderer.setProperty(this._el.nativeElement, 'textContent', this._format(value));
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                this._renderer.setProperty(this._el.nativeElement, 'textContent', this._format(this.target));
            }
        };
        requestAnimationFrame(step);
    }

    private _format(value: number): string {
        const rounded = this.decimals > 0
            ? value.toFixed(this.decimals)
            : Math.round(value).toLocaleString('en-IN');
        return `${this.prefix}${rounded}${this.suffix}`;
    }
}