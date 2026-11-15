import { HttpErrorResponse } from '@angular/common/http';
import { catchError, OperatorFunction, throwError } from 'rxjs';
import { ProductError } from '../../domain/errors/product.error';

export function productErrorFromHttp(error: unknown): ProductError {
  if (error instanceof ProductError) return error;
  if (!(error instanceof HttpErrorResponse)) return new ProductError('unknown');
  if (error.status === 0) return new ProductError('connection', 0);
  if (error.status === 404) return new ProductError('notFound', 404);
  if (error.status === 409) return new ProductError('duplicateId', 409);
  return new ProductError('service', error.status);
}

export function handleProductError<T>(): OperatorFunction<T, T> {
  return catchError((error: unknown) => throwError(() => productErrorFromHttp(error)));
}
