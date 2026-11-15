import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { loggingInterceptor } from './logging.interceptor';

describe('loggingInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([loggingInterceptor])),
      provideHttpClientTesting()
    ] });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    http.verify();
    jest.restoreAllMocks();
  });

  it('registra la respuesta sin incluir parámetros ni cabeceras', () => {
    const next = jest.fn();
    client.get('/bp/products?token=secret', { headers: { Authorization: 'secret' } }).subscribe(next);
    const request = http.expectOne('/bp/products?token=secret');
    const requestId = request.request.headers.get('X-Request-ID');
    expect(requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(request.request.headers.get('Authorization')).toBe('secret');
    expect(console.info).toHaveBeenCalledWith('[HTTP] Petición', {
      requestId, method: 'GET', url: '/bp/products'
    });
    request.flush({ data: [] });
    expect(next).toHaveBeenCalledWith({ data: [] });
    expect(console.info).toHaveBeenCalledWith('[HTTP] Respuesta', {
      requestId, method: 'GET', url: '/bp/products', status: 200, durationMs: expect.any(Number)
    });
    expect(JSON.stringify(jest.mocked(console.info).mock.calls)).not.toContain('secret');
  });

  it.each([400, 401, 403, 404, 500, 503])('registra y propaga el error %s', status => {
    const error = jest.fn();
    client.get('/bp/products').subscribe({ error });
    const request = http.expectOne('/bp/products');
    const requestId = request.request.headers.get('X-Request-ID');
    request.flush({}, { status, statusText: 'Error' });
    expect(error).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
    expect(console.error).toHaveBeenCalledWith('[HTTP] Error', {
      requestId, method: 'GET', url: '/bp/products', status, durationMs: expect.any(Number)
    });
  });

  it('genera un identificador distinto para peticiones simultáneas', () => {
    client.get('/bp/products').subscribe();
    client.get('/bp/products').subscribe();
    const requests = http.match('/bp/products');
    expect(requests).toHaveLength(2);
    expect(requests[0].request.headers.get('X-Request-ID'))
      .not.toBe(requests[1].request.headers.get('X-Request-ID'));
    requests.forEach(request => request.flush({ data: [] }));
  });
});
