import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputField } from '../components/input-field/input-field';
import { InputDate } from '../components/input-date/input-date';

@Component({
  imports: [ReactiveFormsModule, InputField, InputDate],
  template: `<form [formGroup]="form">
    <app-input-field formControlName="id" label="ID" hint="Obligatorio" />
    <app-input-date formControlName="date" label="Fecha" />
  </form>`,
})
class Host {
  readonly form = new FormGroup({
    id: new FormControl('', { nonNullable: true, validators: Validators.required }),
    date: new FormControl('2030-06-15', { nonNullable: true }),
  });
}

describe('ValueFieldControl reactive forms', () => {
  let fixture: ComponentFixture<Host>;
  let inputs: NodeListOf<HTMLInputElement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    inputs = (fixture.nativeElement as HTMLElement).querySelectorAll('input');
  });

  it('muestra valores programáticos sin repetir valueChanges', async () => {
    const changed = jest.fn();
    fixture.componentInstance.form.valueChanges.subscribe(changed);
    fixture.componentInstance.form.controls.id.setValue('visa-001');
    await fixture.whenStable();
    expect(inputs[0].value).toBe('visa-001');
    expect(changed).toHaveBeenCalledTimes(1);
    expect(inputs[1].value).toBe('2030-06-15');
  });

  it('propaga escritura y blur como dirty y touched', async () => {
    inputs[0].value = 'visa-001';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[0].dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    const control = fixture.componentInstance.form.controls.id;
    expect(control.value).toBe('visa-001');
    expect(control.dirty).toBe(true);
    expect(control.touched).toBe(true);
  });

  it('sincroniza fechas y estados disabled desde el formulario', async () => {
    inputs[1].value = '2031-06-15';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[1].dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.form.controls.date.value).toBe('2031-06-15');
    expect(fixture.componentInstance.form.controls.date.touched).toBe(true);
    fixture.componentInstance.form.disable();
    await fixture.whenStable();
    expect(inputs[0].disabled).toBe(true);
    expect(inputs[1].disabled).toBe(true);
    fixture.componentInstance.form.enable();
    await fixture.whenStable();
    expect(inputs[1].disabled).toBe(false);
  });

  it('muestra errores al tocar el campo y los limpia al reiniciar', async () => {
    inputs[0].dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(inputs[0].getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('ID no válido! Este campo es requerido.');
    fixture.componentInstance.form.reset();
    await fixture.whenStable();
    expect(inputs[0].getAttribute('aria-invalid')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Obligatorio');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('muestra errores que existían antes de renderizar el campo', async () => {
    const preTouched = TestBed.createComponent(Host);
    preTouched.componentInstance.form.controls.id.markAsTouched();
    await preTouched.whenStable();
    expect(preTouched.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'ID no válido!',
    );
  });
});
