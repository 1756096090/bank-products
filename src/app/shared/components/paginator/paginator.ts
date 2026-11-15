import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-paginator',
  imports: [MatIconModule],
  templateUrl: './paginator.html',
  styleUrl: './paginator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Paginator {
  readonly totalPages = input.required<number>();
  readonly page = model(1);

  readonly visiblePages = computed(() => {
    const count = Math.min(3, this.totalPages());
    const start = Math.max(1, Math.min(this.page() - 1, this.totalPages() - count + 1));
    return Array.from({ length: count }, (_, index) => start + index);
  });

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.page.set(page);
    }
  }
}
