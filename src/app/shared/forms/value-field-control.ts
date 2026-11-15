import {
  AfterViewInit,
  DestroyRef,
  Directive,
  Injector,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { validationMessage } from './validation-messages';

@Directive()
export abstract class ValueFieldControl implements ControlValueAccessor, AfterViewInit {
  readonly value = model('');
  readonly disabled = input(false);
  readonly error = input('');
  readonly blurred = output<void>();
  private readonly formDisabled = signal(false);
  private readonly validationError = signal('');
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly errorMessage = computed(() => this.error() || this.validationError());

  ngAfterViewInit(): void {
    const ngControl = this.injector.get(NgControl, null, { self: true });
    const control = ngControl?.control ?? null;
    const updateError = () =>
      this.validationError.set(validationMessage(control, ngControl?.name ?? null));
    updateError();
    control?.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(updateError);
  }

  writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : '');
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  updateValue(value: string): void {
    if (this.isDisabled()) return;
    this.value.set(value);
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
    this.blurred.emit();
  }
}
