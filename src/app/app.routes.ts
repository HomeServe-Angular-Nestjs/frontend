import { Routes } from '@angular/router';
import { authRoutes } from './modules/routes/auth/auth.routes';
import { customerRoutes } from './modules/routes/customer/customer.routes';
import { providerRoutes } from './modules/routes/provider/provider.routes';
import { adminRoute } from './modules/routes/admin/admin.route';
import { RootRedirectGuard } from './core/guards/root-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [RootRedirectGuard],
  },
  {
    path: 'provider',
    pathMatch: 'full',
    redirectTo: 'provider/dashboard'
  },
  ...authRoutes,
  ...customerRoutes,
  ...providerRoutes,
  ...adminRoute,
  {
    path: '**',
    loadComponent: () => import('./modules/pages/404 page/404.component')
      .then(c => c.NotFoundComponent),
    data: { type: 'route' }
  }
];
