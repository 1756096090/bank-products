import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { ProductListPage } from './product-list-page';
import { ProductService } from '../../../application/product.service';
import { ProductError } from '../../../domain/errors/product.error';
import { MOCK_PRODUCTS } from '../../../data/mocks/products.mock';
import { mockNativeDialog } from '../../../../../shared/testing/native-dialog.stub';

describe('ProductListPage deletion', () => {
  let fixture: ComponentFixture<ProductListPage>;
  let component: ProductListPage;
  let restoreDialog: () => void;
  let service: {
    getAll: jest.Mock;
    delete: jest.Mock;
    errorMessage: ProductService['errorMessage'];
  };

  beforeEach(async () => {
    restoreDialog = mockNativeDialog();
    service = {
      getAll: jest.fn().mockReturnValue(of(MOCK_PRODUCTS)),
      delete: jest.fn().mockReturnValue(of(undefined)),
      errorMessage: ProductService.prototype.errorMessage,
    };
    await TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [provideRouter([]), { provide: ProductService, useValue: service }],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  afterEach(() => restoreDialog());

  it('muestra el nombre del producto y no elimina hasta confirmar', async () => {
    component.tableActions[1].execute(MOCK_PRODUCTS[0]);
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain(MOCK_PRODUCTS[0].name);
    expect(service.delete).not.toHaveBeenCalled();
    dialog.querySelector('button')!.click();
    await fixture.whenStable();
    expect(component.productToDelete()).toBeNull();
    expect(component.products()).toEqual(MOCK_PRODUCTS);
    expect(service.delete).not.toHaveBeenCalled();
  });

  it('confirma, elimina por ID y actualiza filas y contador', async () => {
    component.deleteProduct(MOCK_PRODUCTS[0]);
    await fixture.whenStable();
    fixture.nativeElement.querySelectorAll('dialog button')[1].click();
    await fixture.whenStable();
    expect(service.delete).toHaveBeenCalledWith(MOCK_PRODUCTS[0].id);
    expect(component.products()).toEqual([MOCK_PRODUCTS[1]]);
    expect(fixture.nativeElement.querySelector('.data-table__results').textContent).toContain(
      '1 Resultados',
    );
    expect(component.productToDelete()).toBeNull();
    expect(service.getAll).toHaveBeenCalledTimes(1);
  });

  it('evita peticiones duplicadas y cancelaciones mientras se elimina', async () => {
    const response = new Subject<void>();
    service.delete.mockReturnValue(response);
    component.confirmDelete();
    expect(service.delete).not.toHaveBeenCalled();
    component.deleteProduct(MOCK_PRODUCTS[0]);
    component.confirmDelete();
    component.confirmDelete();
    component.cancelDelete();
    component.deleteProduct(MOCK_PRODUCTS[1]);
    await fixture.whenStable();
    expect(service.delete).toHaveBeenCalledTimes(1);
    expect(component.productToDelete()?.id).toBe(MOCK_PRODUCTS[0].id);
    expect(fixture.nativeElement.querySelectorAll('dialog button:disabled')).toHaveLength(2);
    response.next();
    response.complete();
    await fixture.whenStable();
    expect(component.deleting()).toBe(false);
    expect(component.productToDelete()).toBeNull();
  });

  it.each([0, 404, 500])(
    'conserva el producto tras un error %s y permite reintentar',
    async (status) => {
      service.delete.mockReturnValue(
        throwError(
          () =>
            new ProductError(
              status === 0 ? 'connection' : status === 404 ? 'notFound' : 'service',
              status,
            ),
        ),
      );
      component.deleteProduct(MOCK_PRODUCTS[0]);
      component.confirmDelete();
      await fixture.whenStable();
      expect(component.products()).toEqual(MOCK_PRODUCTS);
      expect(component.productToDelete()).not.toBeNull();
      expect(fixture.nativeElement.querySelector('dialog [role="alert"]')).not.toBeNull();
      expect(component.deleting()).toBe(false);
      service.delete.mockReturnValue(of(undefined));
      component.confirmDelete();
      await fixture.whenStable();
      expect(component.products()).toEqual([MOCK_PRODUCTS[1]]);
      expect(component.productToDelete()).toBeNull();
    },
  );

  it('conserva el buscador y muestra vacío al eliminar su único resultado', async () => {
    component.searchTerm.set(MOCK_PRODUCTS[0].name);
    component.deleteProduct(MOCK_PRODUCTS[0]);
    component.confirmDelete();
    await fixture.whenStable();
    expect(component.searchTerm()).toBe(MOCK_PRODUCTS[0].name);
    expect(component.filteredProducts()).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.data-table__empty')).not.toBeNull();
    expect(component.products()).toHaveLength(1);
  });

  it('vuelve a una página válida al eliminar el último registro de la segunda página', async () => {
    const products = Array.from({ length: 6 }, (_, index) => ({
      ...MOCK_PRODUCTS[0],
      id: `test-${index}`,
      name: `Producto ${index}`,
    }));
    service.getAll.mockReturnValue(of(products));
    const paginated = TestBed.createComponent(ProductListPage);
    await paginated.whenStable();
    paginated.nativeElement.querySelector('[aria-label="Página 2"]').click();
    await paginated.whenStable();
    paginated.componentInstance.deleteProduct(products[5]);
    paginated.componentInstance.confirmDelete();
    await paginated.whenStable();
    expect(paginated.nativeElement.querySelector('[aria-current="page"]').textContent.trim()).toBe(
      '1',
    );
    expect(paginated.nativeElement.querySelectorAll('tbody .data-table__row')).toHaveLength(5);
  });
});
