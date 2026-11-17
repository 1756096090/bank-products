export type ProductErrorCode = 'connection' | 'notFound' | 'duplicateId' | 'service' | 'unknown';

export class ProductError extends Error {
  constructor(
    readonly code: ProductErrorCode,
    readonly status?: number,
    readonly serviceMessage?: string,
  ) {
    super(code);
    this.name = 'ProductError';
  }
}
