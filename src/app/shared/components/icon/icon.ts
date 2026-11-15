import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Ícono decorativo basado en la fuente Material Symbols (cargada en index.html).
// El nombre se dibuja como ligadura; el tamaño se ajusta con font-size desde el componente padre.
@Component({
  selector: 'app-icon',
  template: '{{ name() }}',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-icon',
    'aria-hidden': 'true',
  },
})
export class Icon {
  readonly name = input.required<string>();
}
