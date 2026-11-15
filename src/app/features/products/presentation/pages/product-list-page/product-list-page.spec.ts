import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListPage } from './product-list-page';
import { of, throwError } from 'rxjs';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/product-repository.token';
import { MOCK_PRODUCTS } from '../../../data/mocks/products.mock';
import { HttpErrorResponse } from '@angular/common/http';

describe('ProductListPage', () => {
  let component: ProductListPage;
  let fixture: ComponentFixture<ProductListPage>;
  const repository = { getAll: jest.fn() };

  beforeEach(async () => {
    repository.getAll.mockReturnValue(of(MOCK_PRODUCTS));
    await TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [{ provide: PRODUCT_REPOSITORY, useValue: repository }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
      expect(failedFixture.nativeElement.querySelector('[role="alert"]').textContent)
        .toContain('Error de servicio');
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it.each([400, 401, 403, 404, 500, 503])('muestra el error HTTP %s dentro de la tabla', async status => {
    repository.getAll.mockReturnValue(throwError(() => new HttpErrorResponse({ status })));
    const failedFixture = TestBed.createComponent(ProductListPage);
    await failedFixture.whenStable();
    const element = failedFixture.nativeElement as HTMLElement;
    expect(element.querySelector('tbody [role="alert"]')?.textContent).toContain(`Error de servicio ${status}`);
    expect(element.querySelector('tbody mat-icon')).not.toBeNull();
    expect(element.querySelector('.data-table__empty')).toBeNull();
  });

  it('distingue un error de conexión de una lista vacía', async () => {
    repository.getAll.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const failedFixture = TestBed.createComponent(ProductListPage);
    await failedFixture.whenStable();
    expect(failedFixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain('Error de conexión');
  });
});
