import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Skeleton } from '../skeleton/skeleton';

@Component({
  selector: 'app-form-skeleton',
  imports: [Skeleton],
  templateUrl: './form-skeleton.html',
  styleUrl: './form-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSkeleton {
  readonly fields = input(6);
  readonly fieldIndexes = computed(() =>
    Array.from({ length: this.fields() }, (_, index) => index),
  );
}
