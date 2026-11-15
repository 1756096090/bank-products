import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  Subject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  finalize,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { Product } from '../../../domain/models/product.model';
import { ProductService } from '../../../application/product.service';
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

@Component({
  selector: 'app-product-form-page',
  imports: [ReactiveFormsModule, InputField, InputDate, CustomButton],
  templateUrl: './product-form-page.html',
  styleUrl: './product-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPage {
  private readonly productsService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly builder = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();

  readonly saving = signal(false);
  readonly serviceError = signal('');
  readonly loading = signal(false);
  readonly loadError = signal('');
  readonly editingId = signal<string | null>(null);
  readonly originalProduct = signal<Product | null>(null);
  readonly isEditing = computed(() => this.editingId() !== null);
  readonly fieldsDisabled = computed(() => this.loading() || this.saving() || !!this.loadError());
  readonly today = todayIso();
  readonly minimumReleaseDate = computed(() => {
    const original = this.originalProduct()?.dateRelease;
    return original && original < this.today ? original : this.today;
  });

  readonly form = this.builder.group({
    id: [
      '',
      [trimmedRequired, Validators.minLength(3), Validators.maxLength(10)],
      [uniqueProductId(this.productsService)],
    ],
    name: ['', [trimmedRequired, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [trimmedRequired, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', trimmedRequired],
    dateRelease: [
      '',
      [
        Validators.required,
        (control) =>
          this.isEditing() && control.value === this.originalProduct()?.dateRelease
            ? null
            : releaseDateValidator(control),
      ],
    ],
    dateRevision: [{ value: '', disabled: true }],
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });
  readonly idStatus = toSignal(this.form.controls.id.statusChanges, {
    initialValue: this.form.controls.id.status,
  });
  readonly canSubmit = computed(() => this.formStatus() === 'VALID' && !this.fieldsDisabled());

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.serviceError.set(''));
    this.form.controls.dateRelease.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.form.controls.dateRevision.setValue(revisionDate(value));
    });
    combineLatest([
      this.route.paramMap.pipe(
        map((params) => params.get('id')),
        distinctUntilChanged(),
      ),
      this.reload.pipe(startWith(undefined)),
    ])
      .pipe(
        map(([id]) => id),
        switchMap((id) => {
          this.editingId.set(id);
          this.originalProduct.set(null);
          this.serviceError.set('');
          this.loadError.set('');
          this.form.reset();
          if (!id) {
            this.form.controls.id.enable();
            return of(null);
          }
          this.form.controls.id.disable();
          this.loading.set(true);
          return this.productsService.getById(id).pipe(
            catchError((error: unknown) => {
              this.loadError.set(this.productsService.errorMessage(error, 'load'));
              return of(null);
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((product) => {
        const id = this.editingId();
        if (!product || !id) return;
        // El ID de la URL identifica el producto que se edita.
        const original = { ...product, id };
        this.originalProduct.set(original);
        this.form.reset({ ...original, dateRevision: revisionDate(original.dateRelease) });
      });
  }

  retryLoad(): void {
    if (!this.loading() && !this.saving()) this.reload.next();
  }

  retryVerification(): void {
    this.form.controls.id.updateValueAndValidity();
  }

  reset(): void {
    if (this.fieldsDisabled()) return;
    const original = this.originalProduct();
    this.form.reset(
      original ? { ...original, dateRevision: revisionDate(original.dateRelease) } : {},
    );
    this.serviceError.set('');
  }

  submit(): void {
    if (this.fieldsDisabled()) return;
    this.form.controls.dateRelease.updateValueAndValidity();
    this.form.markAllAsTouched();
    if (this.form.invalid || this.form.pending) return;
    const product = this.form.getRawValue();
    // Recalcular la revisión antes de guardar.
    product.dateRevision = revisionDate(product.dateRelease);
    if (!product.dateRevision) return;
    this.saving.set(true);
    this.serviceError.set('');
    const id = this.editingId();
    const request = id
      ? this.productsService.update(id, { ...product, id })
      : this.productsService.create(product);
    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/products']);
        },
        error: (error: unknown) => {
          this.serviceError.set(this.productsService.errorMessage(error, 'save'));
        },
      });
  }
}
