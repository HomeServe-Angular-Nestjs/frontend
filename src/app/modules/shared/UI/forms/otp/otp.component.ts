import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject, Subscription, takeUntil, timer } from "rxjs";
import { SignupAuthService } from "../../../../../core/services/signup-auth.service";

@Component({
    selector: 'app-otp',
    templateUrl: './otp.component.html',
    imports: [CommonModule, FormsModule]
})
export class OtpComponent implements OnDestroy, OnInit {
    @Input({ required: true }) email!: string;
    @Output() code = new EventEmitter<string>();
    @Output() resendOTP = new EventEmitter<void>();
    otpDigits = ['', '', '', ''];
    canResend = false;
    countdown = signal(10);

    private destroy$ = new Subject<void>();
    private timerSubscription!: Subscription;


    ngOnInit(): void {
        this.startTimer();
    }

    public get isOtpComplete(): boolean {
        return this.otpDigits.every(d => d.length === 1);
    }


    onOtpInput(event: any, index: number) {
        const input = event.target;
        const value = input.value;


        // Update the digit in our array
        this.otpDigits[index] = value;

        // Handle focus changes for next input
        if (value && index < this.otpDigits.length - 1) {
            const nextInput = document.querySelectorAll('input[type=text]')[index + 1] as HTMLInputElement;
            nextInput?.focus();
            return;
        }

        // Handle focus changes for backspaced input
        if (event.inputType === 'deleteContentBackward' && index > 0) {
            const prevInput = document.querySelectorAll('input[type=text]')[index - 1] as HTMLInputElement;
            prevInput?.focus();
        }
    }

    verifyOtp() {
        this.code.emit(this.otpDigits.join(''));
    }

    resendOtp() {
        if (!this.canResend) return;
        this.canResend = false;
        this.countdown.set(10);
        this.startTimer();
        this.resendOTP.emit();
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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    closeModal() { }
}