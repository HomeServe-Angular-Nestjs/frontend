import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authFeature } from './store/feature/auth.feature';
import { authEffects } from './store/effects/auth.effects';
import { metaReducers } from './store/reducers/meta.reducer';
import { responseInterceptor } from './core/interceptors/response.interceptor';



export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, responseInterceptor])
    ),
    provideStore(
      { [authFeature.name]: authFeature.reducer },
      { metaReducers }
    ),
    provideEffects(authEffects)
  ]
};
