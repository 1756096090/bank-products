import { Product } from '../../domain/models/product.model';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'visa-001',
    name: 'Visa Signature',
    description: 'Tarjeta de crédito con beneficios exclusivos',
    logo: 'https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg',
    dateRelease: '2026-12-01',
    dateRevision: '2027-12-01',
  },
  {
    id: 'save-001',
    name: 'Cuenta de Ahorros',
    description: 'Cuenta bancaria para gestionar tus ahorros',
    logo: '',
    dateRelease: '2026-12-15',
    dateRevision: '2027-12-15',
  },
];
