import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ProductService } from './product.service';
import { PRODUCT_REPOSITORY } from '../domain/repositories/product-repository.token';
import { MockProductRepository } from '../data/repositories/mock-product.repository';
import { MOCK_PRODUCTS } from '../data/mocks/products.mock';

describe('Productos con repositorio mock real', () => {
  it('lista, verifica, crea, consulta, edita y elimina sin proveedores HTTP', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PRODUCT_REPOSITORY, useClass: MockProductRepository }],
    });
    const service = TestBed.inject(ProductService);
    const initial = await firstValueFrom(service.getAll());
    expect(initial).toEqual(MOCK_PRODUCTS);

    const product = { ...initial[0], id: 'mock-new', name: 'Producto de prueba' };
    expect(await firstValueFrom(service.exists(product.id))).toBe(false);
    await firstValueFrom(service.create(product));
    expect(await firstValueFrom(service.exists(product.id))).toBe(true);
    expect(await firstValueFrom(service.getById(product.id))).toEqual(product);
    await expect(firstValueFrom(service.create(product))).rejects.toMatchObject({
      code: 'duplicateId',
    });

    await firstValueFrom(service.update(product.id, { ...product, name: 'Producto editado' }));
    expect((await firstValueFrom(service.getById(product.id))).name).toBe('Producto editado');
    expect(await firstValueFrom(service.getAll())).toHaveLength(initial.length + 1);

    await firstValueFrom(service.delete(product.id));
    expect(await firstValueFrom(service.getAll())).toEqual(initial);
    expect(await firstValueFrom(service.exists(product.id))).toBe(false);
    await expect(firstValueFrom(service.getById(product.id))).rejects.toMatchObject({
      code: 'notFound',
    });
    expect(MOCK_PRODUCTS).toEqual(initial);
  });
});
