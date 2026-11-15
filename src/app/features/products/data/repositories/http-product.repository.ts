import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Product } from '../../domain/models/product.model';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { environment } from '../../../../../environments/environment';

interface ProductsResponse {
  data: Product[];
}

@Injectable()
export class HttpProductRepository implements ProductRepository {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Product[]> {
    return this.http
      .get<ProductsResponse>(`${environment.apiUrl}/bp/products`)
      .pipe(map((response) => response.data));
  }

  exists(id: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${environment.apiUrl}/bp/products/verification/${encodeURIComponent(id)}`,
    );
  }

  create(product: Product): Observable<Product> {
    return this.http
      .post<{ data: Product }>(`${environment.apiUrl}/bp/products`, product)
      .pipe(map((response) => response.data));
  }
}
