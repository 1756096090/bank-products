import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
    },{
        path: 'products',
        loadComponent: () =>
            import('./features/products/presentation/pages/product-list-page/product-list-page')
            .then(m => m.ProductListPage)

    },
    {
        path: '**',
        redirectTo: 'products'
    }
];
