import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListPage } from './product-list-page';
import { of, throwError } from 'rxjs';
import { ProductService } from '../../../application/product.service';
import { MOCK_PRODUCTS } from '../../../data/mocks/products.mock';
import { ProductError } from '../../../domain/errors/product.error';
import { Router, provideRouter } from '@angular/router';

describe('ProductListPage', () => {
  let component: ProductListPage;
  let fixture: ComponentFixture<ProductListPage>;
  const repository = { getAll: jest.fn(), errorMessage: ProductService.prototype.errorMessage };

  beforeEach(async () => {
    repository.getAll.mockReturnValue(of(MOCK_PRODUCTS));
    await TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [provideRouter([]), { provide: ProductService, useValue: repository }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('abre la edición con el ID del producto en la URL', () => {
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.tableActions[0].execute(MOCK_PRODUCTS[0]);
    expect(navigate).toHaveBeenCalledWith(['/products', MOCK_PRODUCTS[0].id, 'edit']);
  });

  it.each([
    ['  VISA  ', [MOCK_PRODUCTS[0]]],
    ['gestionar', [MOCK_PRODUCTS[1]]],
    ['save-001', [MOCK_PRODUCTS[1]]],
    ['   ', MOCK_PRODUCTS],
    ['sin coincidencias', []],
  ])('filtra desde el buscador con "%s"', async (term, expected) => {
    const input = fixture.nativeElement.querySelector('app-input-field input') as HTMLInputElement;
    input.value = term;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(component.filteredProducts()).toEqual(expected);
    expect(component.products()).toEqual(MOCK_PRODUCTS);
    expect(fixture.nativeElement.querySelector('.data-table__results').textContent).toContain(
      `${expected.length} Resultados`,
    );
    if (!expected.length) {
      expect(fixture.nativeElement.querySelector('.data-table__empty')).not.toBeNull();
    }
  });

  it('habilita Agregar para abrir el registro', () => {
    expect(fixture.nativeElement.querySelector('app-custom-button button').disabled).toBe(false);
  });

  it('should display products from the repository', () => {
    expect(component.products()).toEqual(MOCK_PRODUCTS);
    expect(fixture.nativeElement.textContent).toContain(MOCK_PRODUCTS[0].name);
  });

  it('should display an alert when loading fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      repository.getAll.mockReturnValue(throwError(() => new Error('API unavailable')));
      const failedFixture = TestBed.createComponent(ProductListPage);
      await failedFixture.whenStable();
      expect(failedFixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
        'Error de servicio',
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it.each([400, 401, 403, 404, 500, 503])(
    'muestra el error HTTP %s dentro de la tabla',
    async (status) => {
      repository.getAll.mockReturnValue(
        throwError(
          () =>
            new ProductError(
              status === 0 ? 'connection' : status === 404 ? 'notFound' : 'service',
              status,
            ),
        ),
      );
      const failedFixture = TestBed.createComponent(ProductListPage);
      await failedFixture.whenStable();
      const element = failedFixture.nativeElement as HTMLElement;
      expect(element.querySelector('tbody [role="alert"]')?.textContent).toContain(
        `Error de servicio ${status}`,
      );
      expect(element.querySelector('tbody mat-icon')).not.toBeNull();
      expect(element.querySelector('.data-table__empty')).toBeNull();
    },
  );

  it('distingue un error de conexión de una lista vacía', async () => {
    repository.getAll.mockReturnValue(throwError(() => new ProductError('connection', 0)));
    const failedFixture = TestBed.createComponent(ProductListPage);
    await failedFixture.whenStable();
    expect(failedFixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Error de conexión',
    );
  });
});
