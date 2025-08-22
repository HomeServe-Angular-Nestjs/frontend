import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject, Subscription, takeUntil, timer } from "rxjs";
import { LoadingSpinnerComponent } from "../../../../../UI/spinner/spinner.component";
import { LoadingService } from "../../../../../core/services/public/loading.service";

@Component({
    selector: 'app-otp',
    templateUrl: './otp.component.html',
    imports: [CommonModule, FormsModule, LoadingSpinnerComponent]
})
export class OtpComponent implements OnDestroy, OnInit {
    private readonly _loadingService = inject(LoadingService);
    private destroy$ = new Subject<void>();
    private timerSubscription!: Subscription;

    private readonly RESEND_VALUE_IN_SEC = 60;

    @Input({ required: true }) email!: string;
    @Input() userType = 'customer';

    @Output() code = new EventEmitter<string>();
    @Output() resendOTP = new EventEmitter<void>();
    @Output() closeModalEvent = new EventEmitter<void>();

    otpDigits: string[] = ['', '', '', ''];
    canResend = false;
    countdown = signal(this.RESEND_VALUE_IN_SEC);

    get isLoading(): boolean {
        return this._loadingService.loading;
    }

    ngOnInit(): void {
        this.startTimer();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public get isOtpComplete(): boolean {
        return this.otpDigits.every(d => d.length === 1);
    }

    private startTimer() {
        this.timerSubscription = timer(1000, 1000).pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.countdown.update(v => v - 1);
            if (this.countdown() <= 0) {
                this.canResend = true;
                this.timerSubscription.unsubscribe();
            }
        });
    }

    onOtpInput(event: Event, index: number): void {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        this.otpDigits[index] = value;

        if (value && index < this.otpDigits.length) {
            const nextInput = document.querySelectorAll('.otpInput')[index + 1] as HTMLInputElement;
            nextInput?.focus();
        }
    }

    onOtpKeydown(event: KeyboardEvent, index: number): void {
        const input = event.target as HTMLInputElement;

        if (event.key === 'Backspace') {
            if (!input.value && index > 0) {
                const prevInput = document.querySelectorAll('input[type=text]')[index - 1] as HTMLInputElement;
                prevInput?.focus();
            }
        }
    }

    verifyOtp() {
        this.code.emit(this.otpDigits.join(''));
    }

    resendOtp() {
        if (!this.canResend) return;
        this.canResend = false;
        this.countdown.set(this.RESEND_VALUE_IN_SEC);
        this.otpDigits = ['', '', '', ''];
        this.startTimer();
        this.resendOTP.emit();
    }

    closeModal() {
        this.closeModalEvent.emit();
    }
}