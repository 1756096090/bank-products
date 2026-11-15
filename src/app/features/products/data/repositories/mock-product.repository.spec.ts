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

  it('verifica IDs existentes y nuevos', async () => {
    expect(await firstValueFrom(repository.exists(MOCK_PRODUCTS[0].id))).toBe(true);
    expect(await firstValueFrom(repository.exists('new-001'))).toBe(false);
  });

  it('carga y actualiza el producto sin alterar su ID ni los mocks originales', async () => {
    const original = await firstValueFrom(repository.getById(MOCK_PRODUCTS[0].id));
    const updated = await firstValueFrom(
      repository.update(original.id, { ...original, id: 'otro', name: 'Producto editado' }),
    );
    expect(updated.id).toBe(original.id);
    expect((await firstValueFrom(repository.getById(original.id))).name).toBe('Producto editado');
    expect(MOCK_PRODUCTS[0].name).toBe(original.name);
    await expect(firstValueFrom(repository.getById('unknown'))).rejects.toMatchObject({
      code: 'notFound',
    });
    await expect(firstValueFrom(repository.update('unknown', original))).rejects.toMatchObject({
      code: 'notFound',
    });
  });

  it('crea el producto sin modificar los mocks originales', async () => {
    const product = { ...MOCK_PRODUCTS[0], id: 'new-001' };
    expect(await firstValueFrom(repository.create(product))).toEqual(product);
    expect(await firstValueFrom(repository.exists(product.id))).toBe(true);
    expect(await firstValueFrom(repository.getAll())).toContainEqual(product);
    expect(MOCK_PRODUCTS.some((item) => item.id === product.id)).toBe(false);
    await expect(firstValueFrom(repository.create(product))).rejects.toMatchObject({
      code: 'duplicateId',
    });
  });
});
