import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputField } from './input-field';

describe('InputField', () => {
  let fixture: ComponentFixture<InputField>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputField] }).compileComponents();
    fixture = TestBed.createComponent(InputField);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('muestra el campo sin icono por defecto', () => {
    const input = element.querySelector('input')!;
    expect(input.type).toBe('text');
    expect(input.placeholder).toBe('Escribe aquí...');
    expect(input.disabled).toBe(false);
    expect(element.querySelector('button')).toBeNull();
  });

  it('asocia el label y el hint al campo', async () => {
    fixture.componentRef.setInput('label', 'Nombre');
    fixture.componentRef.setInput('hint', 'Entre 5 y 100 caracteres');
    await fixture.whenStable();
    const input = element.querySelector('input')!;
    expect(element.querySelector('label')!.htmlFor).toBe(input.id);
    expect(
      element.querySelector(`#${input.getAttribute('aria-describedby')}`)?.textContent,
    ).toContain('Entre 5 y 100 caracteres');
  });

  it('prioriza el error sobre el hint y limpia el estado al corregirlo', async () => {
    fixture.componentRef.setInput('hint', 'Escribe tu nombre');
    fixture.componentRef.setInput('error', 'Este campo es requerido');
    await fixture.whenStable();
    const input = element.querySelector('input')!;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.classList.contains('input-field__control--invalid')).toBe(true);
    const alert = element.querySelector('[role="alert"]')!;
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
    expect(element.querySelectorAll('.input-field__message')).toHaveLength(1);
    fixture.componentRef.setInput('error', '');
    await fixture.whenStable();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.textContent).toContain('Escribe tu nombre');
  });

  it('genera identificadores distintos entre campos', async () => {
    const another = TestBed.createComponent(InputField);
    await another.whenStable();
    expect(element.querySelector('input')!.id).not.toBe(
      another.nativeElement.querySelector('input').id,
    );
  });

  it('actualiza el valor y notifica al padre al escribir', async () => {
    const changed = jest.fn();
    fixture.componentInstance.value.subscribe(changed);
    const input = element.querySelector('input')!;
    input.value = 'Visa';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('Visa');
    expect(changed).toHaveBeenCalledWith('Visa');
  });

  it('refleja el valor, tipo y placeholder recibidos', async () => {
    fixture.componentRef.setInput('value', 'Cuenta');
    fixture.componentRef.setInput('type', 'search');
    fixture.componentRef.setInput('placeholder', 'Buscar productos');
    await fixture.whenStable();
    const input = element.querySelector('input')!;
    expect(input.value).toBe('Cuenta');
    expect(input.type).toBe('search');
    expect(input.placeholder).toBe('Buscar productos');
  });

  it('muestra un icono accesible y emite el valor al pulsarlo', async () => {
    const clicked = jest.fn();
    fixture.componentInstance.iconClick.subscribe(clicked);
    fixture.componentRef.setInput('icon', 'search');
    fixture.componentRef.setInput('iconLabel', 'Buscar productos');
    fixture.componentRef.setInput('value', 'Visa');
    await fixture.whenStable();
    const button = element.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Buscar productos');
    expect(button.querySelector('mat-icon')?.textContent?.trim()).toBe('search');
    button.click();
    expect(clicked).toHaveBeenCalledWith('Visa');
  });

  it('deshabilita el campo y el icono sin emitir acciones', async () => {
    const clicked = jest.fn();
    fixture.componentInstance.iconClick.subscribe(clicked);
    fixture.componentRef.setInput('icon', 'search');
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    expect(element.querySelector('input')!.disabled).toBe(true);
    const button = element.querySelector('button')!;
    expect(button.disabled).toBe(true);
    button.click();
    fixture.componentInstance.onIconClick();
    expect(clicked).not.toHaveBeenCalled();
  });
});
