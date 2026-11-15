import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  model,
  signal
} from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { TableColumn } from './models/table-column.model';
import { TableAction } from './models/table-action.model';
import { TableCellDirective } from './table-cell.directive';

@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet, MatIconModule, OverlayModule, ScrollingModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTable<T extends object> {

  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly errorMessage = input<string | null>(null);
  readonly actions = input<readonly TableAction<T>[]>([]);

  readonly pageSizeOptions = input<readonly number[]>([
    5, 10, 15, 20, 30
  ]);

  readonly pageSize = model(5);

  readonly openedRow = signal<T | null>(null);

  readonly actionMenuPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 }
  ];

  readonly total = computed(() => this.rows().length);

  readonly visibleRows = computed(() =>
    this.rows().slice(0, this.pageSize())
  );

  // Plantillas de celdas
  readonly cellTemplates = contentChildren(TableCellDirective);

  getCellTemplate(key: string): TableCellDirective | undefined {
    return this.cellTemplates().find(
      template => template.tableCell() === key
    );
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.pageSize.set(Number(select.value));
    this.openedRow.set(null);
  }

  toggleActions(row: T): void {
    this.openedRow.update(current =>
      current === row ? null : row
    );
  }

  executeAction(action: TableAction<T>, row: T): void {
    this.openedRow.set(null);
    action.execute(row);
  }
}
