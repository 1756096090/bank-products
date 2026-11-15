import { firstValueFrom } from 'rxjs';

import { MockProductRepository } from './mock-product.repository';
import { MOCK_PRODUCTS } from '../mocks/products.mock';

describe('MockProductRepository', () => {
  let repository: MockProductRepository;

  beforeEach(() => {
    repository = new MockProductRepository();
  });

  it('should return mock products', async () => {
    const products = await firstValueFrom(repository.getAll());

    expect(products).toEqual(MOCK_PRODUCTS);
  });

  it('should return an array of products', async () => {
    const products = await firstValueFrom(repository.getAll());

    expect(Array.isArray(products)).toBe(true);
  });
});