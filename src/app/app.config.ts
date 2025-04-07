import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authFeature } from './store/feature/auth.feature';
import { authEffects } from './store/effects/auth.effects';
import { metaReducers } from './store/reducers/meta.reducer';
import { responseInterceptor } from './core/interceptors/response.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations'
import { userFeature } from './store/feature/user.feature';
import { userEffects } from './store/effects/user.effect';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideStore(
      {
        [authFeature.name]: authFeature.reducer,
        [userFeature.name]: userFeature.reducer
      },
      { metaReducers }
    ),
    provideEffects(authEffects, userEffects)
  ]
};
