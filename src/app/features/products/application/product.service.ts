import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../domain/models/product.model';
import { PRODUCT_REPOSITORY } from '../domain/repositories/product-repository.token';
import { ProductError } from '../domain/errors/product.error';

type ProductOperation = 'list' | 'load' | 'save' | 'delete';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly repository = inject(PRODUCT_REPOSITORY);

  getAll(): Observable<Product[]> {
    return this.repository.getAll();
  }
  getById(id: string): Observable<Product> {
    return this.repository.getById(id);
  }
  exists(id: string): Observable<boolean> {
    return this.repository.exists(id);
  }
  create(product: Product): Observable<Product> {
    return this.repository.create(product);
  }
  update(id: string, product: Product): Observable<Product> {
    return this.repository.update(id, { ...product, id });
  }

  delete(id: string): Observable<void> {
    return this.repository.delete(id);
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
      if (error.status) return `Error de servicio ${error.status}: ${failure} ${action}.`;
    }
    return `Error de servicio: ${failure} ${action}.`;
  }
}
