import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loggingInterceptor } from './core/http/logging.interceptor';
import { routes } from './app.routes';
import { PRODUCT_REPOSITORY } from './features/products/domain/repositories/product-repository.token';
import { MockProductRepository } from './features/products/data/repositories/mock-product.repository';
import { HttpProductRepository } from './features/products/data/repositories/http-product.repository';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loggingInterceptor])),
    {
      provide: PRODUCT_REPOSITORY,
      useClass: environment.useMocks ? MockProductRepository : HttpProductRepository,
    },
  ],
};
