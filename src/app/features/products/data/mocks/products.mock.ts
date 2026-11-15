import { Product } from '../../domain/models/product.model';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'visa-001',
    name: 'Visa Signature',
    description: 'Tarjeta de crédito con beneficios exclusivos',
    logo: 'https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg',
    date_release: '2026-12-01',
    date_revision: '2027-12-01',
  },
  {
    id: 'save-001',
    name: 'Cuenta de Ahorros',
    description: 'Cuenta bancaria para gestionar tus ahorros',
    logo: '',
    date_release: '2026-12-15',
    date_revision: '2027-12-15',
  },
];
