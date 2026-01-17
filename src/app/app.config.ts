import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouterConfigOptions, withDebugTracing, withInMemoryScrolling, withRouterConfig, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations'
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { NgxSpinnerModule } from 'ngx-spinner';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { authFeature } from './store/auth/auth.feature';
import { userFeature } from './store/users/user.feature';
import { providerFeature } from './store/provider/provider.feature';
import { customerFeature } from './store/customer/customer.feature';
import { chatFeature } from './store/chat/chat.feature';

import { authEffects } from './store/auth/auth.effects';
import { userEffects } from './store/users/user.effect';
import { providerEffects } from './store/provider/provider.effects';
import { customerEffects } from './store/customer/customer.effects';
import { ToastrModule } from 'ngx-toastr';
import { chatEffects } from './store/chat/chats.effect';
import { metaReducers } from './store/auth/meta.reducer';
import { ErrorHandlerService } from './core/services/public/error-handler.service';
import { notificationFeature } from './store/notification/notification.feature';
import { notificationEffects } from './store/notification/notification.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    ErrorHandlerService,
    provideAnimations(),
    importProvidersFrom(
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        positionClass: 'toast-top-center',
        timeOut: 3000,
        progressBar: true,
        closeButton: true
      }),
      NgxSpinnerModule.forRoot()
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      // withDebugTracing(),
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({
      [authFeature.name]: authFeature.reducer,
      [userFeature.name]: userFeature.reducer,
      [providerFeature.name]: providerFeature.reducer,
      [customerFeature.name]: customerFeature.reducer,
      [chatFeature.name]: chatFeature.reducer,
      [notificationFeature.name]: notificationFeature.reducer,
    }, { metaReducers }),
    provideEffects(
      notificationEffects,
      customerEffects,
      providerEffects,
      authEffects,
      userEffects,
      chatEffects,
    ),
    provideStoreDevtools({ maxAge: 25, logOnly: true, autoPause: true }),
  ]
};
