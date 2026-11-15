import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Product } from '../../domain/models/product.model';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { MOCK_PRODUCTS } from '../mocks/products.mock';

@Injectable()
export class MockProductRepository implements ProductRepository {

  getAll(): Observable<Product[]> {
    return of(MOCK_PRODUCTS);
  }

}