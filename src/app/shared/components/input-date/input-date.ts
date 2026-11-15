import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueFieldControl } from '../../forms/value-field-control';
import { InputField } from '../input-field/input-field';

@Component({
  selector: 'app-input-date',
  imports: [InputField],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputDate), multi: true },
  ],
  templateUrl: './input-date.html',
  styles: ':host { display: block; width: 100%; min-width: 0; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDate extends ValueFieldControl {
  readonly label = input('Fecha');
  readonly hint = input('');
  readonly required = input(false);
  readonly readOnly = input(false);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
}
