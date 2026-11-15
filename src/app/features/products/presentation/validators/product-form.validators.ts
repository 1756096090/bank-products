import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { ProductService } from '../../application/product.service';

export function todayIso(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isIsoDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );
}

export function revisionDate(release: string): string {
  if (!isIsoDate(release)) return '';
  const [year, month, day] = release.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year + 1, month, 0)).getUTCDate();
  return `${year + 1}-${String(month).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
}

export const releaseDateValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  if (!control.value) return null;
  return isIsoDate(control.value) && control.value >= todayIso() ? null : { releaseDate: true };
};

export const trimmedRequired: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };

export function uniqueProductId(service: ProductService): AsyncValidatorFn {
  return (control) =>
    timer(300).pipe(
      switchMap(() => service.exists(control.value)),
      map((exists) => (exists ? { idExists: true } : null)),
      catchError(() => of({ verificationFailed: true })),
    );
}
