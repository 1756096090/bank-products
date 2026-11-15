import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ProductService } from './product.service';
import { PRODUCT_REPOSITORY } from '../domain/repositories/product-repository.token';
import { ProductError } from '../domain/errors/product.error';
import { MOCK_PRODUCTS } from '../data/mocks/products.mock';

describe('ProductService', () => {
  let service: ProductService;
  const repository = {
    getAll: jest.fn(),
    getById: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: PRODUCT_REPOSITORY, useValue: repository }],
    });
    service = TestBed.inject(ProductService);
    repository.getAll.mockReturnValue(of(MOCK_PRODUCTS));
    repository.getById.mockReturnValue(of(MOCK_PRODUCTS[0]));
    repository.exists.mockReturnValue(of(true));
    repository.create.mockReturnValue(of(MOCK_PRODUCTS[0]));
    repository.update.mockReturnValue(of(MOCK_PRODUCTS[0]));
  });

  it('expone las operaciones de productos a la presentación', async () => {
    expect(await firstValueFrom(service.getAll())).toEqual(MOCK_PRODUCTS);
    expect(await firstValueFrom(service.getById('visa-001'))).toEqual(MOCK_PRODUCTS[0]);
    expect(repository.getById).toHaveBeenCalledWith('visa-001');
    expect(await firstValueFrom(service.exists('visa-001'))).toBe(true);
    expect(await firstValueFrom(service.create(MOCK_PRODUCTS[0]))).toEqual(MOCK_PRODUCTS[0]);
    expect(repository.create).toHaveBeenCalledWith(MOCK_PRODUCTS[0]);
  });

  it('preserva el ID de la URL al actualizar', async () => {
    await firstValueFrom(service.update('visa-001', { ...MOCK_PRODUCTS[0], id: 'alterado' }));
    expect(repository.update).toHaveBeenCalledWith('visa-001', MOCK_PRODUCTS[0]);
  });

  it('propaga errores de dominio y centraliza sus mensajes', async () => {
    const error = new ProductError('service', 500);
    repository.getAll.mockReturnValue(throwError(() => error));
    await expect(firstValueFrom(service.getAll())).rejects.toBe(error);
    expect(service.errorMessage(error, 'list')).toBe(
      'Error de servicio 500: no se pudieron cargar los productos.',
    );
    expect(service.errorMessage(error, 'load')).toBe(
      'Error de servicio 500: no se pudo cargar el producto.',
    );
    expect(service.errorMessage(error, 'save')).toBe(
      'Error de servicio 500: no se pudo guardar el producto.',
    );
    expect(service.errorMessage(new ProductError('connection', 0), 'list')).toContain(
      'Error de conexión',
    );
    expect(service.errorMessage(new ProductError('notFound', 404), 'load')).toBe(
      'El producto no existe.',
    );
    expect(service.errorMessage(new ProductError('duplicateId', 409), 'save')).toContain(
      'ID ya existe',
    );
    expect(service.errorMessage(new Error('Secret error'), 'save')).not.toContain('Secret error');
  });
});
