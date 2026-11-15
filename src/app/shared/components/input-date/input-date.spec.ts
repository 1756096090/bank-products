import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputDate } from './input-date';
import { MOCK_PRODUCTS } from '../../../features/products/data/mocks/products.mock';

describe('InputDate', () => {
  let fixture: ComponentFixture<InputDate>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputDate] }).compileComponents();
    fixture = TestBed.createComponent(InputDate);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('muestra el selector nativo con label, hint y límites', async () => {
    fixture.componentRef.setInput('label', 'Fecha de liberación');
    fixture.componentRef.setInput('hint', 'Selecciona la fecha del producto');
    fixture.componentRef.setInput('min', '2026-01-01');
    fixture.componentRef.setInput('max', '2026-12-31');
    fixture.componentRef.setInput('required', true);
    await fixture.whenStable();
    const input = element.querySelector('input')!;
    expect(input.type).toBe('date');
    expect(input.min).toBe('2026-01-01');
    expect(input.max).toBe('2026-12-31');
    expect(input.required).toBe(true);
    expect(element.querySelector('label')!.htmlFor).toBe(input.id);
    expect(element.textContent).toContain('Selecciona la fecha del producto');
  });

  it('recibe y emite fechas ISO sin convertirlas de zona horaria', async () => {
    const changed = jest.fn();
    fixture.componentInstance.value.subscribe(changed);
    fixture.componentRef.setInput('value', MOCK_PRODUCTS[0].date_release);
    await fixture.whenStable();
    const input = element.querySelector('input')!;
    expect(input.value).toBe(MOCK_PRODUCTS[0].date_release);
    input.value = MOCK_PRODUCTS[0].date_revision;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(changed).toHaveBeenCalledWith(MOCK_PRODUCTS[0].date_revision);
    expect(fixture.componentInstance.value()).toBe(MOCK_PRODUCTS[0].date_revision);
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(changed).toHaveBeenLastCalledWith('');
  });

  it('permite deshabilitar o dejar la fecha de solo lectura', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    const input = element.querySelector('input')!;
    expect(input.disabled).toBe(true);
    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('readOnly', true);
    await fixture.whenStable();
    expect(input.disabled).toBe(false);
    expect(input.readOnly).toBe(true);
  });

  it('muestra el error accesible en lugar del hint', async () => {
    fixture.componentRef.setInput('hint', 'Fecha del producto');
    fixture.componentRef.setInput('error', 'La fecha es requerida');
    await fixture.whenStable();
    const input = element.querySelector('input')!;
    const alert = element.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain('La fecha es requerida');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(element.textContent).not.toContain('Fecha del producto');
  });
});
