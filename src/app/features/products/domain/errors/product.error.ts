export type ProductErrorCode = 'connection' | 'notFound' | 'duplicateId' | 'service' | 'unknown';

export class ProductError extends Error {
  constructor(
    readonly code: ProductErrorCode,
    readonly status?: number,
  ) {
    super(code);
    this.name = 'ProductError';
  }
}
