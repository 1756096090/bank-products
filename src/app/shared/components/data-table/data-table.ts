import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  contentChildren,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { TableColumn } from './models/table-column.model';
import { TableAction } from './models/table-action.model';
import { TableCellDirective } from './table-cell.directive';
import { Paginator } from '../paginator/paginator';

interface MenuPosition {
  top: number;
  right: number;
}

// Separación entre el botón y el menú, y margen mínimo con el borde de la ventana.
const MENU_OFFSET = 4;
const VIEWPORT_MARGIN = 8;

@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet, MatIconModule, Paginator],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeActions(true)',
    '(window:resize)': 'closeActions()',
    '(window:scroll)': 'closeActions()',
  },
})
export class DataTable<T extends object> {
  private readonly injector = inject(Injector);
  private readonly actionMenu = viewChild<ElementRef<HTMLElement>>('actionMenu');
  private menuTrigger: HTMLElement | null = null;

  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly errorMessage = input<string | null>(null);
  readonly actions = input<readonly TableAction<T>[]>([]);

  readonly pageSizeOptions = input<readonly number[]>([5, 10, 15, 20, 30]);

  readonly pageSize = model(5);

  readonly openedRow = signal<T | null>(null);
  readonly menuPosition = signal<MenuPosition>({ top: 0, right: 0 });

  readonly total = computed(() => this.rows().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly currentPage = linkedSignal({
    source: () => ({ rows: this.rows(), pageSize: this.pageSize() }),
    computation: () => 1,
  });

  readonly visibleRows = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });

  // Plantillas de celdas
  readonly cellTemplates = contentChildren(TableCellDirective);

  getCellTemplate(key: string): TableCellDirective | undefined {
    return this.cellTemplates().find((template) => template.tableCell() === key);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.pageSize.set(Number(select.value));
    this.closeActions();
  }

  // Menú de acciones
  toggleActions(row: T, trigger: HTMLElement): void {
    if (this.openedRow() === row) {
      this.closeActions();
      return;
    }

    this.menuTrigger = trigger;
    this.openedRow.set(row);
    this.menuPosition.set(this.positionBelow(trigger.getBoundingClientRect()));

    // Con el menú ya pintado se conoce su alto: se ajusta y se enfoca la primera opción.
    afterNextRender(
      () => {
        const menu = this.actionMenu()?.nativeElement;
        if (!menu) return;
        this.fitInViewport(trigger.getBoundingClientRect(), menu.offsetHeight);
        menu.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  closeActions(restoreFocus = false): void {
    if (!this.openedRow()) return;

    this.openedRow.set(null);
    if (restoreFocus) this.menuTrigger?.focus();
    this.menuTrigger = null;
  }

  executeAction(action: TableAction<T>, row: T): void {
    this.closeActions(true);
    action.execute(row);
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const clickedInside =
      this.actionMenu()?.nativeElement.contains(target) || this.menuTrigger?.contains(target);

    if (!clickedInside) this.closeActions();
  }

  onMenuKeydown(event: KeyboardEvent): void {
    const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (step === 0) return;

    event.preventDefault();
    const items = Array.from(
      this.actionMenu()?.nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    const current = items.indexOf(document.activeElement as HTMLElement);
    items[(current + step + items.length) % items.length]?.focus();
  }

  // El menú usa position: fixed para no quedar recortado por el scroll horizontal de la tabla.
  private positionBelow(trigger: DOMRect): MenuPosition {
    const viewportWidth = document.documentElement.clientWidth;

    return {
      top: trigger.bottom + MENU_OFFSET,
      right: Math.max(VIEWPORT_MARGIN, viewportWidth - trigger.right),
    };
  }

  private fitInViewport(trigger: DOMRect, menuHeight: number): void {
    const viewportHeight = window.innerHeight;
    const below = trigger.bottom + MENU_OFFSET;
    const above = trigger.top - MENU_OFFSET - menuHeight;

    let top = below;
    if (below + menuHeight > viewportHeight - VIEWPORT_MARGIN) {
      top =
        above >= VIEWPORT_MARGIN
          ? above
          : Math.max(VIEWPORT_MARGIN, viewportHeight - VIEWPORT_MARGIN - menuHeight);
    }

    this.menuPosition.update((position) => ({ ...position, top }));
  }
}
