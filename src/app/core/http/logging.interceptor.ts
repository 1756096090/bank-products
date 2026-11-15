import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { defer, tap } from 'rxjs';

// Patrón Correlation ID: el mismo requestId en petición, respuesta y error.
export const loggingInterceptor: HttpInterceptorFn = (request, next) =>
  defer(() => {
    const startedAt = Date.now();
    const requestId = crypto.randomUUID();
    const tracedRequest = request.clone({ setHeaders: { 'X-Request-ID': requestId } });
    const context = { requestId, method: request.method, url: request.url.split('?')[0] };

    console.info('[HTTP] Petición', context);

    return next(tracedRequest).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            console.info('[HTTP] Respuesta', {
              ...context,
              status: event.status,
              durationMs: Date.now() - startedAt,
            });
          }
        },
        error: (error: unknown) => {
          console.error('[HTTP] Error', {
            ...context,
            status: error instanceof HttpErrorResponse ? error.status : null,
            durationMs: Date.now() - startedAt,
          });
        },
      }),
    );
  });
