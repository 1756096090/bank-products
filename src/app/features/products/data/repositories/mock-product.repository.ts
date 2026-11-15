import { Injectable } from '@angular/core';
import { Observable, defer, of, throwError } from 'rxjs';

import { Product } from '../../domain/models/product.model';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { MOCK_PRODUCTS } from '../mocks/products.mock';

@Injectable()
export class MockProductRepository implements ProductRepository {
  private products = MOCK_PRODUCTS.map((product) => ({ ...product }));

  getAll(): Observable<Product[]> {
    return defer(() => of(this.products.map((product) => ({ ...product }))));
  }

  exists(id: string): Observable<boolean> {
    return defer(() => of(this.products.some((product) => product.id === id)));
  }

  create(product: Product): Observable<Product> {
    return defer(() => {
      if (this.products.some((item) => item.id === product.id)) {
        return throwError(() => new Error('El ID ya existe.'));
      }
      this.products.push({ ...product });
      return of({ ...product });
    });
  }
}
