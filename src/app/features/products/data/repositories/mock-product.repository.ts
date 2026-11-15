import { Injectable } from '@angular/core';
import { Observable, defer, of, throwError } from 'rxjs';

import { Product } from '../../domain/models/product.model';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { MOCK_PRODUCTS } from '../mocks/products.mock';
import { ProductError } from '../../domain/errors/product.error';

@Injectable()
export class MockProductRepository implements ProductRepository {
  private products = MOCK_PRODUCTS.map((product) => ({ ...product }));

  getAll(): Observable<Product[]> {
    return defer(() => of(this.products.map((product) => ({ ...product }))));
  }

  exists(id: string): Observable<boolean> {
    return defer(() => of(this.products.some((product) => product.id === id)));
  }

  getById(id: string): Observable<Product> {
    return defer(() => {
      const product = this.products.find((item) => item.id === id);
      return product ? of({ ...product }) : throwError(() => new ProductError('notFound', 404));
    });
  }

  update(id: string, product: Product): Observable<Product> {
    return defer(() => {
      const index = this.products.findIndex((item) => item.id === id);
      if (index < 0) return throwError(() => new ProductError('notFound', 404));
      this.products[index] = { ...product, id };
      return of({ ...this.products[index] });
    });
  }

  create(product: Product): Observable<Product> {
    return defer(() => {
      if (this.products.some((item) => item.id === product.id)) {
        return throwError(() => new ProductError('duplicateId', 409));
      }
      this.products.push({ ...product });
      return of({ ...product });
    });
  }
}
