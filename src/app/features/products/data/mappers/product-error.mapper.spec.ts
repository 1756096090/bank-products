import { HttpErrorResponse } from '@angular/common/http';
import { productErrorFromHttp } from './product-error.mapper';
import { ProductError } from '../../domain/errors/product.error';

describe('Product error mapper', () => {
  it('conserva el mensaje del backend para errores no contemplados', () => {
    const error = productErrorFromHttp(
      new HttpErrorResponse({
        status: 422,
        error: { message: '  El producto no puede publicarse en esta fecha.  ' },
      }),
    );
    expect(error.serviceMessage).toBe('El producto no puede publicarse en esta fecha.');
    expect(error.code).toBe('service');
  });

  it.each([null, {}, { message: '' }, { message: '   ' }, { message: 42 }, { message: ['error'] }])(
    'mantiene el mensaje genérico si la respuesta no tiene un mensaje válido: %p',
    (body) => {
      expect(
        productErrorFromHttp(new HttpErrorResponse({ status: 500, error: body })).serviceMessage,
      ).toBeUndefined();
    },
  );

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
