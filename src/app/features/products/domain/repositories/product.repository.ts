import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface ProductRepository {
  getAll(): Observable<Product[]>;
}