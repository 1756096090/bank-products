import { setFormField, fieldError } from '../../../../../shared/testing/form-field.helpers';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { ProductError } from '../../../domain/errors/product.error';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { ProductFormPage } from './product-form-page';
import { ProductService } from '../../../application/product.service';
import { Product } from '../../../domain/models/product.model';
import { MOCK_PRODUCTS } from '../../../data/mocks/products.mock';

describe('ProductFormPage editing', () => {
  let fixture: ComponentFixture<ProductFormPage>;
  let component: ProductFormPage;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let repository: {
    getById: jest.Mock;
    update: jest.Mock;
    exists: jest.Mock;
    create: jest.Mock;
    errorMessage: ProductService['errorMessage'];
  };
  let navigate: jest.SpyInstance;
  const original: Product = {
    ...MOCK_PRODUCTS[0],
    dateRelease: '2000-06-15',
    dateRevision: '2001-06-15',
  };

  beforeEach(async () => {
    params = new BehaviorSubject(convertToParamMap({ id: original.id }));
    repository = {
      getById: jest.fn().mockReturnValue(of(original)),
      update: jest.fn().mockImplementation((_id: string, product: Product) => of(product)),
      exists: jest.fn().mockReturnValue(of(false)),
      create: jest.fn(),
      errorMessage: ProductService.prototype.errorMessage,
    };
    await TestBed.configureTestingModule({
      imports: [ProductFormPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        { provide: ProductService, useValue: repository },
      ],
    }).compileComponents();
    navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  async function createPage(): Promise<void> {
    fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  it('carga el ID de la URL y bloquea el campo sin verificar su existencia', async () => {
    await createPage();
    expect(repository.getById).toHaveBeenCalledWith(original.id);
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect(inputs[0].value).toBe(original.id);
    expect(inputs[0].disabled).toBe(true);
    expect(inputs[1].value).toBe(original.name);
    expect(fixture.nativeElement.textContent).toContain('Formulario de Edición');
    expect(repository.exists).not.toHaveBeenCalled();
    setFormField(fixture, 'id', 'otro-id');
    expect(component.form.controls.id.value).toBe(original.id);
  });

  it('actualiza con el ID de la URL, conserva la fecha original y regresa al listado', async () => {
    await createPage();
    setFormField(fixture, 'name', 'Producto editado');
    component.form.controls.id.setValue('alterado');
    component.submit();
    await fixture.whenStable();
    expect(repository.update).toHaveBeenCalledWith(original.id, {
      ...original,
      name: 'Producto editado',
    });
    expect(repository.create).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/products']);
  });

  it('restaura los datos originales al reiniciar', async () => {
    await createPage();
    setFormField(fixture, 'name', 'Producto cambiado');
    setFormField(fixture, 'dateRelease', '2035-10-20');
    expect(component.form.controls.dateRevision.value).toBe('2036-10-20');
    component.reset();
    expect(component.form.getRawValue()).toEqual(original);
    expect(component.form.pristine).toBe(true);
    expect(component.form.untouched).toBe(true);
    expect(component.form.controls.id.disabled).toBe(true);
    expect(component.form.controls.dateRevision.disabled).toBe(true);
  });

  it('rechaza una fecha pasada diferente de la original y conserva las validaciones', async () => {
    await createPage();
    setFormField(fixture, 'dateRelease', '2001-01-01');
    expect(fieldError(fixture, 'dateRelease')).toContain('posterior a hoy');
    setFormField(fixture, 'name', 'abc');
    component.submit();
    expect(fieldError(fixture, 'name')).toContain('Mínimo 5');
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('bloquea el formulario durante la carga', async () => {
    const response = new Subject<Product>();
    repository.getById.mockReturnValue(response);
    await createPage();
    expect(component.loading()).toBe(true);
    expect(fixture.nativeElement.querySelector('app-form-skeleton')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(component.canSubmit()).toBe(false);
    component.submit();
    expect(repository.update).not.toHaveBeenCalled();
    response.next(original);
    response.complete();
    await fixture.whenStable();
    expect(component.loading()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-form-skeleton')).toBeNull();
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(component.canSubmit()).toBe(true);
  });

  it.each([404, 500, 0])('muestra el error de carga %s y permite reintentar', async (status) => {
    repository.getById.mockReturnValue(
      throwError(
        () =>
          new ProductError(
            status === 0 ? 'connection' : status === 404 ? 'notFound' : 'service',
            status,
          ),
      ),
    );
    await createPage();
    expect(component.loadError()).not.toBe('');
    if (status === 404) expect(component.loadError()).toBe('El producto no existe.');
    if (status === 500) expect(component.loadError()).toContain('500');
    component.submit();
    expect(repository.update).not.toHaveBeenCalled();
    repository.getById.mockReturnValue(of(original));
    (fixture.nativeElement.querySelector('.product-form-page__retry') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(component.loadError()).toBe('');
    expect(component.form.controls.name.value).toBe(original.name);
    expect(component.canSubmit()).toBe(true);
  });

  it('no repite el PUT y conserva los cambios si falla el servicio', async () => {
    const response = new Subject<Product>();
    repository.update.mockReturnValue(response);
    await createPage();
    setFormField(fixture, 'name', 'Producto cambiado');
    component.submit();
    component.submit();
    expect(repository.update).toHaveBeenCalledTimes(1);
    response.error(new ProductError('service', 500));
    await fixture.whenStable();
    expect(component.serviceError()).toContain('500');
    expect(component.form.controls.name.value).toBe('Producto cambiado');
    expect(component.saving()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('cancela una carga anterior cuando cambia el ID de la URL', async () => {
    const first = new Subject<Product>();
    repository.getById.mockReturnValueOnce(first);
    await createPage();
    const second = { ...original, id: 'save-001', name: 'Segundo producto' };
    repository.getById.mockReturnValue(of(second));
    params.next(convertToParamMap({ id: second.id }));
    first.next(original);
    await fixture.whenStable();
    expect(component.form.controls.name.value).toBe(second.name);
    component.submit();
    expect(repository.update).toHaveBeenCalledWith(second.id, second);
  });
});
