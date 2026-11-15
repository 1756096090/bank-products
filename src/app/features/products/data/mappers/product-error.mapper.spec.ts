import { HttpErrorResponse } from '@angular/common/http';
import { productErrorFromHttp } from './product-error.mapper';
import { ProductError } from '../../domain/errors/product.error';

describe('Product error mapper', () => {
  it.each([
    [0, 'connection'],
    [404, 'notFound'],
    [409, 'duplicateId'],
    [400, 'service'],
    [500, 'service'],
  ])('traduce HTTP %s al error de dominio %s', (status, code) => {
    const error = productErrorFromHttp(new HttpErrorResponse({ status: Number(status) }));
    expect(error).toBeInstanceOf(ProductError);
    expect(error.code).toBe(code);
    expect(error.status).toBe(status);
    expect(error).not.toBeInstanceOf(HttpErrorResponse);
  });

  it('preserva errores de dominio y normaliza errores desconocidos', () => {
    const error = new ProductError('notFound', 404);
    expect(productErrorFromHttp(error)).toBe(error);
    expect(productErrorFromHttp(new Error('Internal detail')).code).toBe('unknown');
  });
});
