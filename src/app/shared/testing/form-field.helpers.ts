import { ComponentFixture } from '@angular/core/testing';

export function setFormField<T>(fixture: ComponentFixture<T>, name: string, value: string): void {
  const element = fixture.nativeElement as HTMLElement;
  const input = element.querySelector<HTMLInputElement>(`[formControlName="${name}"] input`);
  if (!input) throw new Error(`No existe el campo ${name}`);
  if (input.disabled || input.readOnly || input.matches(':disabled')) return;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

export function fieldError<T>(fixture: ComponentFixture<T>, name: string): string {
  fixture.detectChanges();
  const element = fixture.nativeElement as HTMLElement;
  return (
    element.querySelector(`[formControlName="${name}"] .input-field__message--error`)
      ?.textContent ?? ''
  );
}
