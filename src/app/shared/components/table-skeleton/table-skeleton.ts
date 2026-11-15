import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Skeleton } from '../skeleton/skeleton';

@Component({
  selector: 'tbody[appTableSkeleton]',
  imports: [Skeleton],
  templateUrl: './table-skeleton.html',
  styleUrl: './table-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class TableSkeleton {
  readonly columns = input.required<number>();
  readonly rows = input(5);
  readonly rowIndexes = computed(() => Array.from({ length: this.rows() }, (_, index) => index));
  readonly columnIndexes = computed(() =>
    Array.from({ length: this.columns() }, (_, index) => index),
  );
}
