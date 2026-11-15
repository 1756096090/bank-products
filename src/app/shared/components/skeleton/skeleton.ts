import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: '',
  styleUrl: './skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'skeleton',
    'aria-hidden': 'true',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[class.skeleton--circle]': "shape() === 'circle'",
  },
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('16px');
  readonly shape = input<'rectangle' | 'circle'>('rectangle');
}
