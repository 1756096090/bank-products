import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Product } from '../domain/models/product.model';
import { PRODUCT_REPOSITORY } from '../domain/repositories/product-repository.token';
import { ProductError } from '../domain/errors/product.error';
import { ErrorDialogService } from '../../../shared/components/error-dialog/error-dialog.service';

type ProductOperation = 'list' | 'load' | 'save' | 'delete';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly repository = inject(PRODUCT_REPOSITORY);
  private readonly errorDialog = inject(ErrorDialogService);

  getAll(): Observable<Product[]> {
    return this.withErrorDialog(this.repository.getAll(), 'list');
  }
  getById(id: string): Observable<Product> {
    return this.withErrorDialog(this.repository.getById(id), 'load');
  }
  exists(id: string): Observable<boolean> {
    return this.withErrorDialog(this.repository.exists(id), 'load');
  }
  create(product: Product): Observable<Product> {
    return this.withErrorDialog(this.repository.create(product), 'save');
  }
  update(id: string, product: Product): Observable<Product> {
    return this.withErrorDialog(this.repository.update(id, { ...product, id }), 'save');
  }

  delete(id: string): Observable<void> {
    return this.withErrorDialog(this.repository.delete(id), 'delete');
  }

  private withErrorDialog<T>(source: Observable<T>, operation: ProductOperation): Observable<T> {
    return source.pipe(
      tap({
        error: (error: unknown) => {
          if (
            !(error instanceof ProductError) ||
            error.code === 'service' ||
            error.code === 'unknown'
          ) {
            this.errorDialog.show(this.errorMessage(error, operation));
          }
        },
      }),
    );
  }

  errorMessage(error: unknown, operation: ProductOperation): string {
    const action = {
      list: 'cargar los productos',
      load: 'cargar el producto',
      save: 'guardar el producto',
      delete: 'eliminar el producto',
    }[operation];
    const failure = operation === 'list' ? 'no se pudieron' : 'no se pudo';
    if (error instanceof ProductError) {
      if (error.code === 'connection')
        return 'Error de conexión: no se pudo contactar con el servicio.';
      if (error.code === 'notFound' && operation !== 'list') return 'El producto no existe.';
      if (error.code === 'duplicateId') return 'El ID ya existe. Utiliza otro identificador.';
      const message =
        error.serviceMessage?.trim() ||
        (error.status
          ? `Error de servicio ${error.status}: ${failure} ${action}.`
          : `Error de servicio: ${failure} ${action}.`);
      return message;
    }
    const message = `Error de servicio: ${failure} ${action}.`;
    return message;
  }
}
