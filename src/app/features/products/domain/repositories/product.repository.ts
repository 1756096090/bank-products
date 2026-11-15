import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface ProductRepository {
  getAll(): Observable<Product[]>;
  getById(id: string): Observable<Product>;
  exists(id: string): Observable<boolean>;
  create(product: Product): Observable<Product>;
  update(id: string, product: Product): Observable<Product>;
  delete(id: string): Observable<void>;
}
