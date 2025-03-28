import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type ThemeType = 'customer' | 'provider';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private currentTheme = new BehaviorSubject<ThemeType>('customer');
    currentTheme$ = this.currentTheme.asObservable();

    setTheme(theme: ThemeType): void {
        this.currentTheme.next(theme);
        this.updateThemeClasses(theme);
    }

    private updateThemeClasses(theme: ThemeType): void {
        const root = document.documentElement;
        root.classList.remove('customer-theme', 'provider-theme');
        root.classList.add(`${theme}-theme`);
    }
}