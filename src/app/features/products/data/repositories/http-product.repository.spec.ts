import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
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
    http.expectOne(url).flush({ data: MOCK_PRODUCTS });
    expect(next).toHaveBeenCalledWith(MOCK_PRODUCTS);
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
    expect(request.request.body).toEqual(MOCK_PRODUCTS[0]);
    request.flush({ message: 'Product added successfully', data: MOCK_PRODUCTS[0] });
    expect(next).toHaveBeenCalledWith(MOCK_PRODUCTS[0]);
  });

  it('propaga el error al crear', () => {
    const error = jest.fn();
    repository.create(MOCK_PRODUCTS[0]).subscribe({ error });
    http.expectOne(url).flush({}, { status: 400, statusText: 'Bad Request' });
    expect(error).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
  });
});
