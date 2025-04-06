import { Routes } from '@angular/router';
import { authRoutes } from './modules/routes/auth/auth.routes';
import { customerRoutes } from './modules/routes/customer/customer.routes';
import { providerRoutes } from './modules/routes/provider/provider.routes';
import { adminRoute } from './modules/routes/admin/admin.route';

export const routes: Routes = [
    ...authRoutes,
    ...customerRoutes,
    ...providerRoutes,
    ...adminRoute
];
