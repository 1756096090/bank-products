import { productFromDto, productToDto } from './product.mapper';
import { ProductDto } from '../dto/product.dto';

describe('Product mapper', () => {
  const dto: ProductDto = {
    id: 'visa-001',
    name: 'Visa Signature',
    description: 'Tarjeta para viajes',
    logo: 'logo.png',
    date_release: '2030-06-15',
    date_revision: '2031-06-15',
  };
  const product = {
    id: 'visa-001',
    name: 'Visa Signature',
    description: 'Tarjeta para viajes',
    logo: 'logo.png',
    dateRelease: '2030-06-15',
    dateRevision: '2031-06-15',
  };

  it('separa el DTO en snake_case del dominio en camelCase', () => {
    expect(productFromDto(dto)).toEqual(product);
    expect(productFromDto(dto)).not.toHaveProperty('date_release');
    expect(productToDto(product)).toEqual(dto);
    expect(productToDto(product)).not.toHaveProperty('dateRelease');
  });
});
