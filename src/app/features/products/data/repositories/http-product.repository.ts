import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../../domain/models/product.model';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { ProductDto } from '../dto/product.dto';
import { productFromDto, productToDto } from '../mappers/product.mapper';
import { handleProductError } from '../mappers/product-error.mapper';
import { environment } from '../../../../../environments/environment';

@Injectable()
export class HttpProductRepository implements ProductRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/bp/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<{ data: ProductDto[] }>(this.url).pipe(
      map((response) => response.data.map(productFromDto)),
      handleProductError(),
    );
  }

  getById(id: string): Observable<Product> {
    return this.http
      .get<ProductDto>(`${this.url}/${encodeURIComponent(id)}`)
      .pipe(map(productFromDto), handleProductError());
  }

  exists(id: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.url}/verification/${encodeURIComponent(id)}`)
      .pipe(handleProductError());
  }

  create(product: Product): Observable<Product> {
    return this.http.post<{ data: ProductDto }>(this.url, productToDto(product)).pipe(
      map((response) => productFromDto(response.data)),
      handleProductError(),
    );
  }

  update(id: string, product: Product): Observable<Product> {
    return this.http
      .put<{ data: ProductDto }>(
        `${this.url}/${encodeURIComponent(id)}`,
        productToDto({ ...product, id }),
      )
      .pipe(
        map((response) => productFromDto(response.data)),
        handleProductError(),
      );
  }
}
