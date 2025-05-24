import { Component, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { animate, style, keyframes, stagger, query, group, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-spaceman-animation',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './spaceman.component.html',
    styleUrls: ['./spaceman.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('spacemanAnimation', [
            transition('inactive => active', [
                group([
                    query('#headStripe, #spaceman', [
                        style({ transform: 'translateY(0.5px) rotate(1deg)' }),
                        animate('0.8s ease-in-out', style({ transform: 'translateY(-0.5px) rotate(-1deg)' })),
                        animate('0.8s ease-in-out', style({ transform: 'translateY(0.5px) rotate(1deg)' }))
                    ]),
                    query('#craterSmall, #craterBig', [
                        style({ transform: 'translateX(-3px)' }),
                        animate('0.8s ease-in-out', style({ transform: 'translateX(3px)' })),
                        animate('0.8s ease-in-out', style({ transform: 'translateX(-3px)' }))
                    ]),
                    query('#planet', [
                        style({ transform: 'rotate(-2deg)', transformOrigin: '50% 50%' }),
                        animate('0.8s ease-in-out', style({ transform: 'rotate(2deg)' })),
                        animate('0.8s ease-in-out', style({ transform: 'rotate(-2deg)' }))
                    ]),
                    query('#starsBig g', [
                        stagger(80, [
                            animate('0.8s ease-in-out', keyframes([
                                style({ transform: 'rotate(0deg)', offset: 0 }),
                                style({ transform: 'rotate(20deg)', offset: 0.5 }),
                                style({ transform: 'rotate(0deg)', offset: 1 })
                            ]))
                        ])
                    ]),
                    query('#starsSmall g', [
                        stagger(80, [
                            style({ transform: 'scale(0)', transformOrigin: '50% 50%' }),
                            animate('0.4s ease-in-out', style({ transform: 'scale(1)' }))
                        ])
                    ]),
                    query('#circlesSmall circle, #circlesBig circle', [
                        style({ transform: 'translateY(-2px)' }),
                        animate('0.8s ease-in-out', style({ transform: 'translateY(2px)' })),
                        animate('0.8s ease-in-out', style({ transform: 'translateY(-2px)' }))
                    ]),
                    query('#glassShine', [
                        style({ transform: 'translateX(-68px)' }),
                        animate('1.5s ease-in-out', style({ transform: 'translateX(80px) rotate(-30deg)' })),
                        animate('0s', style({ transform: 'translateX(-68px)' })),
                        animate('1.5s 6s ease-in-out', style({ transform: 'translateX(80px) rotate(-30deg)' }))
                    ])
                ])
            ]),
            transition('active => inactive', [
                group([
                    query('#headStripe, #spaceman', [
                        animate('0.8s ease-in-out', style({ transform: 'translateY(0px) rotate(0deg)' }))
                    ]),
                    query('#craterSmall, #craterBig', [
                        animate('0.8s ease-in-out', style({ transform: 'translateX(0px)' }))
                    ]),
                    query('#planet', [
                        animate('0.8s ease-in-out', style({ transform: 'rotate(0deg)' }))
                    ]),
                    query('#starsBig g', [
                        animate('0.8s ease-in-out', style({ transform: 'rotate(0deg)' }))
                    ]),
                    query('#starsSmall g', [
                        animate('0.4s ease-in-out', style({ transform: 'scale(1)' }))
                    ]),
                    query('#circlesSmall circle, #circlesBig circle', [
                        animate('0.8s ease-in-out', style({ transform: 'translateY(0px)' }))
                    ]),
                    query('#glassShine', [
                        animate('0.8s ease-in-out', style({ transform: 'translateX(-68px)' }))
                    ])
                ])
            ])
        ])
    ]
})
export class SpacemanAnimationComponent {
    isHovering = false;
    private debounceTimeout: number | undefined = undefined;

    constructor(private cdr: ChangeDetectorRef) { }

    @HostListener('mouseenter')
    onMouseEnter() {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.isHovering = true;
            this.cdr.markForCheck();
        }, 100) as any as number;
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.isHovering = false;
            this.cdr.markForCheck();
        }, 100) as any as number;
    }
}