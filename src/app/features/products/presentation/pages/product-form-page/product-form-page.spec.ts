import { setFormField, fieldError } from '../../../../../shared/testing/form-field.helpers';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductError } from '../../../domain/errors/product.error';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { ProductFormPage } from './product-form-page';
import { ProductService } from '../../../application/product.service';
import { Product } from '../../../domain/models/product.model';
import { MOCK_PRODUCTS } from '../../../data/mocks/products.mock';
import { todayIso, revisionDate } from '../../validators/product-form.validators';

describe('ProductFormPage', () => {
  let fixture: ComponentFixture<ProductFormPage>;
  let component: ProductFormPage;
  const repository = {
    exists: jest.fn(),
    create: jest.fn(),
    errorMessage: ProductService.prototype.errorMessage,
  };
  let navigate: jest.SpyInstance;

  beforeEach(async () => {
    repository.exists.mockReset().mockReturnValue(of(false));
    repository.create.mockReset().mockImplementation((product: Product) => of(product));
    await TestBed.configureTestingModule({
      imports: [ProductFormPage],
      providers: [provideRouter([]), { provide: ProductService, useValue: repository }],
    }).compileComponents();
    navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  async function validForm(): Promise<void> {
    setFormField(fixture, 'id', 'new-001');
    setFormField(fixture, 'name', MOCK_PRODUCTS[0].name);
    setFormField(fixture, 'description', MOCK_PRODUCTS[0].description);
    setFormField(fixture, 'logo', MOCK_PRODUCTS[0].logo);
    setFormField(fixture, 'dateRelease', todayIso());
    await new Promise((resolve) => setTimeout(resolve, 350));
    await fixture.whenStable();
  }

  it('muestra seis campos y mantiene Enviar deshabilitado al inicio', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect(inputs).toHaveLength(6);
    expect(inputs[5].disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
  });

  it.each([
    ['id', 'ab', 'Mínimo 3'],
    ['id', 'a'.repeat(11), 'Máximo 10'],
    ['name', 'Visa', 'Mínimo 5'],
    ['name', 'a'.repeat(101), 'Máximo 100'],
    ['description', 'Corta', 'Mínimo 10'],
    ['description', 'a'.repeat(201), 'Máximo 200'],
    ['logo', '   ', 'requerido'],
    ['dateRelease', '2000-01-01', 'posterior a hoy'],
  ] as const)('valida %s con %s', (field, value, message) => {
    setFormField(fixture, field, value);
    expect(fieldError(fixture, field)).toContain(message);
    expect(component.canSubmit()).toBe(false);
  });

  it('muestra el error requerido al salir de un campo vacío', async () => {
    const name = fixture.nativeElement.querySelectorAll('input')[1] as HTMLInputElement;
    name.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Este campo es requerido.');
  });

  it('muestra el estado visual de ID inválido debajo del campo', async () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(input.classList.contains('input-field__control--invalid')).toBe(true);
    const message = fixture.nativeElement.querySelector(
      `#${input.getAttribute('aria-describedby')}`,
    ) as HTMLElement;
    expect(message.textContent).toContain('ID no válido!');
    expect(message.classList.contains('input-field__message--error')).toBe(true);
    input.value = 'ab';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(message.textContent).toContain('Mínimo 3 caracteres.');
  });

  it('no consulta la API si el ID tiene longitud inválida', async () => {
    setFormField(fixture, 'id', 'ab');
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(repository.exists).not.toHaveBeenCalled();
  });

  it('bloquea un ID existente', async () => {
    repository.exists.mockReturnValue(of(true));
    await validForm();
    expect(repository.exists).toHaveBeenCalledWith('new-001');
    expect(fieldError(fixture, 'id')).toContain('ya existe');
    component.submit();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('muestra el fallo de verificación y permite reintentar', async () => {
    repository.exists.mockReturnValue(throwError(() => new ProductError('service', 503)));
    await validForm();
    expect(fieldError(fixture, 'id')).toContain('No se pudo verificar');
    expect(component.canSubmit()).toBe(false);
    repository.exists.mockReturnValue(of(false));
    component.retryVerification();
    await new Promise((resolve) => setTimeout(resolve, 350));
    await fixture.whenStable();
    expect(component.canSubmit()).toBe(true);
  });

  it('calcula la revisión, envía el producto y vuelve al listado', async () => {
    await validForm();
    expect(component.form.controls.dateRevision.value).toBe(revisionDate(todayIso()));
    const submit = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submit.disabled).toBe(false);
    submit.click();
    await fixture.whenStable();
    expect(repository.create).toHaveBeenCalledWith({
      id: 'new-001',
      name: MOCK_PRODUCTS[0].name,
      description: MOCK_PRODUCTS[0].description,
      logo: MOCK_PRODUCTS[0].logo,
      dateRelease: todayIso(),
      dateRevision: revisionDate(todayIso()),
    });
    expect(navigate).toHaveBeenCalledWith(['/products']);
  });

  it('bloquea envíos duplicados y conserva el formulario si falla el servicio', async () => {
    const response = new Subject<Product>();
    repository.create.mockReturnValue(response);
    await validForm();
    component.submit();
    component.submit();
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(component.saving()).toBe(true);
    response.error(new ProductError('service', 500));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Error de servicio 500');
    expect(component.saving()).toBe(false);
    expect(component.form.controls.id.value).toBe('new-001');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('reinicia todos los campos, errores y estados de interacción', async () => {
    await validForm();
    (fixture.nativeElement.querySelector('app-custom-button button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(Object.values(component.form.getRawValue()).every((value) => value === '')).toBe(true);
    expect(component.form.pristine).toBe(true);
    expect(component.form.untouched).toBe(true);
    expect(component.form.controls.dateRevision.disabled).toBe(true);
    expect(component.canSubmit()).toBe(false);
  });
});
