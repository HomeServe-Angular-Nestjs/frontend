import { Routes } from "@angular/router";

export const adminRoute: Routes = [
    {
        path: 'admin',
        children: [
            {
                path: 'homepage',
                loadComponent: () => import('../../auth/admin/homepage/admin-homepage.component')
                    .then(c => c.AdminHomepageComponent)
            }
        ]
    }
]