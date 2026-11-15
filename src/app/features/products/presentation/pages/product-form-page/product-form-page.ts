import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/product-repository.token';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { InputDate } from '../../../../../shared/components/input-date/input-date';
import { CustomButton } from '../../../../../shared/components/custom-button/custom-button';
import {
  releaseDateValidator,
  revisionDate,
  todayIso,
  trimmedRequired,
  uniqueProductId,
} from '../../validators/product-form.validators';

type FieldName = 'id' | 'name' | 'description' | 'logo' | 'date_release' | 'date_revision';

@Component({
  selector: 'app-product-form-page',
  imports: [ReactiveFormsModule, InputField, InputDate, CustomButton],
  templateUrl: './product-form-page.html',
  styleUrl: './product-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPage {
  private readonly repository = inject(PRODUCT_REPOSITORY);
  private readonly router = inject(Router);
  private readonly builder = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);

  readonly saving = signal(false);
  readonly serviceError = signal('');
  readonly today = todayIso();

  readonly form = this.builder.group({
    id: [
      '',
      [trimmedRequired, Validators.minLength(3), Validators.maxLength(10)],
      [uniqueProductId(this.repository)],
    ],
    name: ['', [trimmedRequired, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [trimmedRequired, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', trimmedRequired],
    date_release: ['', [Validators.required, releaseDateValidator]],
    date_revision: [{ value: '', disabled: true }],
  });

  private readonly formState = toSignal(this.form.events, { initialValue: null });
  readonly canSubmit = computed(() => {
    this.formState();
    return this.form.valid && !this.form.pending && !this.saving();
  });

  constructor() {
    this.form.controls.date_release.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.form.controls.date_revision.setValue(revisionDate(value));
    });
  }

  setField(field: FieldName, value: string): void {
    const control = this.form.controls[field];
    control.markAsDirty();
    control.setValue(value);
    this.serviceError.set('');
  }

  errorFor(field: FieldName): string {
    this.formState();
    const control = this.form.controls[field];
    if (!control.touched && !control.dirty) return '';
    const prefix = field === 'id' ? 'ID no válido! ' : '';
    if (control.hasError('required')) return `${prefix}Este campo es requerido.`;
    if (control.hasError('minlength'))
      return `${prefix}Mínimo ${control.getError('minlength').requiredLength} caracteres.`;
    if (control.hasError('maxlength'))
      return `${prefix}Máximo ${control.getError('maxlength').requiredLength} caracteres.`;
    if (control.hasError('idExists')) return 'ID no válido! El ID ya existe.';
    if (control.hasError('verificationFailed'))
      return 'No se pudo verificar el ID. Intenta de nuevo.';
    if (control.hasError('releaseDate')) return 'La fecha debe ser igual o posterior a hoy.';
    return '';
  }

  retryVerification(): void {
    this.form.controls.id.updateValueAndValidity();
  }

  reset(): void {
    if (this.saving()) return;
    this.form.reset();
    this.serviceError.set('');
  }

  submit(): void {
    if (this.saving()) return;
    this.form.controls.date_release.updateValueAndValidity();
    this.form.markAllAsTouched();
    if (this.form.invalid || this.form.pending) return;
    const product = this.form.getRawValue();
    // Recalcular la revisión antes de guardar.
    product.date_revision = revisionDate(product.date_release);
    if (!product.date_revision) return;
    this.saving.set(true);
    this.serviceError.set('');
    this.repository
      .create(product)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/products']);
        },
        error: (error: unknown) => {
          this.serviceError.set(
            error instanceof HttpErrorResponse
              ? error.status === 0
                ? 'No se pudo conectar con el servicio. Intenta de nuevo.'
                : `Error de servicio ${error.status}: no se pudo guardar el producto.`
              : 'No se pudo guardar el producto. Intenta de nuevo.',
          );
        },
      });
  }
}
