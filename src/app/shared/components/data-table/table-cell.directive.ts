import { Directive, TemplateRef, inject, input } from '@angular/core';

@Directive({
  selector: 'ng-template[tableCell]',
})
export class TableCellDirective {
  readonly tableCell = input.required<string>();

  readonly template = inject(TemplateRef);
}
