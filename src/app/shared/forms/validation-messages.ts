import { AbstractControl, ValidationErrors } from '@angular/forms';

const messages: Record<string, (details: ValidationErrors) => string> = {
  required: () => 'Este campo es requerido.',
  minlength: (details) => `Mínimo ${details['requiredLength']} caracteres.`,
  maxlength: (details) => `Máximo ${details['requiredLength']} caracteres.`,
  idExists: () => 'El ID ya existe.',
  verificationFailed: () => 'No se pudo verificar el ID. Intenta de nuevo.',
  releaseDate: () => 'La fecha debe ser igual o posterior a hoy.',
};

export function validationMessage(
  control: AbstractControl | null,
  name: string | number | null,
): string {
  if (!control || (!control.touched && !control.dirty) || !control.errors) return '';
  const key = Object.keys(messages).find((key) => control.hasError(key));
  if (!key) return '';
  const prefix = name === 'id' && key !== 'verificationFailed' ? 'ID no válido! ' : '';
  return prefix + messages[key](control.getError(key));
}
