import { ProductError } from '../../domain/errors/product.error';
import { productToDto } from '../mappers/product.mapper';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpProductRepository } from './http-product.repository';
import { MOCK_PRODUCTS } from '../mocks/products.mock';
import { environment } from '../../../../../environments/environment';

describe('HttpProductRepository', () => {
  let repository: HttpProductRepository;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/bp/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), HttpProductRepository],
    });
    repository = TestBed.inject(HttpProductRepository);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('extrae los productos de la respuesta', () => {
    const next = jest.fn();
    repository.getAll().subscribe(next);
    http.expectOne(url).flush({ data: MOCK_PRODUCTS.map(productToDto) });
    expect(next).toHaveBeenCalledWith(MOCK_PRODUCTS);
  });

  it('carga un producto usando el ID codificado en la URL', () => {
    const next = jest.fn();
    repository.getById('prod /001').subscribe(next);
    const request = http.expectOne(`${url}/prod%20%2F001`);
    expect(request.request.method).toBe('GET');
    request.flush(productToDto(MOCK_PRODUCTS[0]));
    expect(next).toHaveBeenCalledWith(MOCK_PRODUCTS[0]);
  });

  it('actualiza por PUT conservando el ID de la URL', () => {
    const next = jest.fn();
    repository.update('visa-001', { ...MOCK_PRODUCTS[0], id: 'alterado' }).subscribe(next);
    const request = http.expectOne(`${url}/visa-001`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.id).toBe('visa-001');
    request.flush({ data: productToDto(MOCK_PRODUCTS[0]) });
    expect(next).toHaveBeenCalledWith(MOCK_PRODUCTS[0]);
  });

  it('propaga un 404 al cargar un ID inexistente', () => {
    const error = jest.fn();
    repository.getById('unknown').subscribe({ error });
    http.expectOne(`${url}/unknown`).flush({}, { status: 404, statusText: 'Not Found' });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });

  it.each([true, false])('consulta la existencia del ID: %s', (exists) => {
    const next = jest.fn();
    repository.exists('visa-001').subscribe(next);
    http.expectOne(`${url}/verification/visa-001`).flush(exists);
    expect(next).toHaveBeenCalledWith(exists);
  });

  it('envía el producto y devuelve el registro creado', () => {
    const next = jest.fn();
    repository.create(MOCK_PRODUCTS[0]).subscribe(next);
    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(productToDto(MOCK_PRODUCTS[0]));
    request.flush({ message: 'Product added successfully', data: productToDto(MOCK_PRODUCTS[0]) });
    expect(next).toHaveBeenCalledWith(MOCK_PRODUCTS[0]);
  });

  it('propaga el error al crear', () => {
    const error = jest.fn();
    repository.create(MOCK_PRODUCTS[0]).subscribe({ error });
    http.expectOne(url).flush({}, { status: 400, statusText: 'Bad Request' });
    expect(error).toHaveBeenCalledWith(expect.any(ProductError));
  });

  it('elimina con DELETE usando el ID codificado y devuelve void', () => {
    const next = jest.fn();
    repository.delete('prod /001').subscribe(next);
    const request = http.expectOne(`${url}/prod%20%2F001`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ message: 'Product removed successfully' });
    expect(next).toHaveBeenCalledWith(undefined);
  });

  it('traduce los errores HTTP de eliminación a errores de dominio', () => {
    const error = jest.fn();
    repository.delete('unknown').subscribe({ error });
    http.expectOne(`${url}/unknown`).flush({}, { status: 404, statusText: 'Not Found' });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ code: 'notFound', status: 404 }));
  });
});
