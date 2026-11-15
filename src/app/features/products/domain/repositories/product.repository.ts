import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface ProductRepository {
  getAll(): Observable<Product[]>;
  exists(id: string): Observable<boolean>;
  create(product: Product): Observable<Product>;
}
