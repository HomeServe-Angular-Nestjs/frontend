import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderSidebarComponent } from '../../../shared/partials/sections/provider/sidebar/provider-sidebar.component';
import { RouterOutlet } from '@angular/router';
import { ProviderHeaderComponent } from "../../../shared/partials/sections/provider/header/provider-header.component";
import { Store } from '@ngrx/store';
import { ChatSocketService } from '../../../../core/services/socket-service/chat.service';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { selectCheckStatus } from '../../../../store/auth/auth.selector';

@Component({
  selector: 'app-provider-layout',
  standalone: true,
  imports: [CommonModule, ProviderSidebarComponent, RouterOutlet, ProviderHeaderComponent],
  templateUrl: './provider-layout.component.html',
  styleUrl: './provider-layout.component.scss',
})
export class ProviderLayoutComponent implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly _chatSocket = inject(ChatSocketService);

  private _destroy$ = new Subject<void>();

  ngOnInit(): void {
    const authStatus$ = this._store.select(selectCheckStatus).pipe(
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    );

    // Connect socket when authenticated
    authStatus$.pipe(
      filter(status => status === 'authenticated')
    ).subscribe(() => {
      this._chatSocket.connect();
      this._chatSocket.stopListeningMessages();
    });

    // Disconnect socket when unauthenticated
    authStatus$.pipe(
      filter(status => status !== 'authenticated')
    ).subscribe(() => {
      this._chatSocket.disconnect();
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
