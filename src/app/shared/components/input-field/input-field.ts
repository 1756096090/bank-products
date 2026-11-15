import { ChangeDetectionStrategy, Component, forwardRef, input, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueFieldControl } from '../../forms/value-field-control';

import { Icon } from '../icon/icon';

let nextFieldId = 0;

@Component({
  selector: 'app-input-field',
  imports: [Icon],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputField), multi: true },
  ],
  templateUrl: './input-field.html',
  styleUrl: './input-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputField extends ValueFieldControl {
  readonly placeholder = input('Escribe aquí...');
  readonly type = input<'text' | 'email' | 'password' | 'search' | 'date'>('text');
  readonly fieldId = input(`input-field-${nextFieldId++}`);
  readonly label = input('');
  readonly hint = input('');
  readonly required = input(false);
  readonly readOnly = input(false);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly iconLabel = input('Acción del campo');

  readonly iconClick = output<string>();

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (!this.readOnly()) this.updateValue(inputElement.value);
  }

  onIconClick(): void {
    if (this.isDisabled()) return;

    this.iconClick.emit(this.value());
  }
}
