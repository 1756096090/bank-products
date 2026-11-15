import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { InputField } from '../input-field/input-field';

@Component({
  selector: 'app-input-date',
  imports: [InputField],
  templateUrl: './input-date.html',
  styles: ':host { display: block; width: 100%; min-width: 0; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDate {
  readonly label = input('Fecha');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);
  readonly required = input(false);
  readonly readOnly = input(false);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly value = model('');
  readonly blurred = output<void>();
}
