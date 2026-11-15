import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTable } from './data-table';
import { TableCellDirective } from './table-cell.directive';
import { TableColumn } from './models/table-column.model';
import { TableAction } from './models/table-action.model';

import { Product } from '../../../features/products/domain/models/product.model';
import { MOCK_PRODUCTS } from '../../../features/products/data/mocks/products.mock';

@Component({
  imports: [DataTable, TableCellDirective],
  template: `
    <app-data-table
      [columns]="columns"
      [rows]="products()"
      [actions]="actions"
      [pageSizeOptions]="[5, 10, 15, 20, 30]"
      [pageSize]="5"
    >
      <div table-title>
        <h2>Productos financieros</h2>
      </div>

      <ng-template tableCell="logo" let-product>
        <span class="test-logo"> Logo: {{ product.name }} </span>
      </ng-template>
    </app-data-table>
  `,
})
class TestHostComponent {
  readonly columns: TableColumn<Product>[] = [
    { key: 'logo', header: 'Logo' },
    { key: 'name', header: 'Nombre' },
  ];

  readonly products = signal<Product[]>(
    Array.from({ length: 12 }, (_, index) => ({
      ...MOCK_PRODUCTS[index % MOCK_PRODUCTS.length],
      id: `test-product-${index + 1}`,
    })),
  );

  editProduct = jest.fn<void, [Product]>();
  deleteProduct = jest.fn<void, [Product]>();

  readonly actions: TableAction<Product>[] = [
    {
      label: 'Editar',
      icon: 'edit',
      execute: (product) => this.editProduct(product),
    },
    {
      label: 'Eliminar',
      icon: 'delete',
      execute: (product) => this.deleteProduct(product),
    },
  ];
}

describe('DataTable', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;

    fixture.detectChanges();
  });

  it('debe crear la tabla', () => {
    const table = element.querySelector('.data-table__table');

    expect(table).not.toBeNull();
  });

  it('muestra los registros de la última página y reinicia al filtrar', async () => {
    const table = fixture.debugElement.children[0].componentInstance as DataTable<Product>;
    (element.querySelector('[aria-label="Página 3"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(table.visibleRows()).toEqual(host.products().slice(10));
    expect(element.querySelectorAll('.data-table__tbody .data-table__row')).toHaveLength(2);
    host.products.set(host.products().slice(0, 2));
    await fixture.whenStable();
    expect(table.currentPage()).toBe(1);
    expect(table.visibleRows()).toHaveLength(2);
  });

  it('vuelve a la primera página al cambiar el tamaño', async () => {
    (element.querySelector('[aria-label="Página 2"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    const select = element.querySelector('select') as HTMLSelectElement;
    select.value = '10';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(element.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('1');
    expect(element.querySelectorAll('.data-table__tbody .data-table__row')).toHaveLength(10);
  });

  it('debe mostrar los encabezados configurados', () => {
    const headers = element.querySelectorAll('.data-table__th');

    expect(headers.length).toBe(3);
    expect(headers[0].textContent).toContain('Logo');
    expect(headers[1].textContent).toContain('Nombre');
  });

  it('debe mostrar inicialmente 5 registros', () => {
    const rows = element.querySelectorAll('.data-table__tbody .data-table__row');

    expect(rows.length).toBe(5);
  });

  it('debe mostrar el total de registros', () => {
    const results = element.querySelector('.data-table__results');

    expect(results?.textContent).toContain('12');
  });

  it('debe mostrar un mensaje cuando no existen registros', () => {
    host.products.set([]);

    fixture.detectChanges();

    const emptyMessage = element.querySelector('.data-table__empty');

    expect(emptyMessage?.textContent).toContain('No hay registros disponibles');
  });

  it('debe cambiar a 10 registros desde el selector', () => {
    const select = element.querySelector('.data-table__select') as HTMLSelectElement;

    select.value = '10';
    select.dispatchEvent(new Event('change'));

    fixture.detectChanges();

    const rows = element.querySelectorAll('.data-table__tbody .data-table__row');

    expect(rows.length).toBe(10);
    expect(select.value).toBe('10');
  });

  it('debe mostrar el título proyectado', () => {
    const title = element.querySelector('.data-table__title h2');

    expect(title?.textContent).toContain('Productos financieros');
  });

  it('debe renderizar una plantilla personalizada', () => {
    const customCells = element.querySelectorAll('.test-logo');

    expect(customCells.length).toBe(5);

    expect(customCells[0].textContent).toContain(`Logo: ${MOCK_PRODUCTS[0].name}`);
  });

  it('debe abrir el menú de acciones', () => {
    const buttons = element.querySelectorAll('.data-table__action-button');

    (buttons[0] as HTMLButtonElement).click();

    fixture.detectChanges();

    const menu = element.querySelector('.data-table__action-menu');

    expect(menu).not.toBeNull();
    expect(menu?.textContent).toContain('Editar');
    expect(menu?.textContent).toContain('Eliminar');
  });

  it('mantiene abierto el menú tras un toque y lo cierra al tocar fuera', async () => {
    const button = element.querySelector('.data-table__action-button') as HTMLButtonElement;
    button.dispatchEvent(new Event('touchstart', { bubbles: true }));
    button.dispatchEvent(new Event('touchend', { bubbles: true }));
    button.click();
    await fixture.whenStable();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelector('.data-table__action-menu')).not.toBeNull();
    document.body.click();
    await fixture.whenStable();

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('.data-table__action-menu')).toBeNull();
  });

  it('debe ejecutar Editar con el producto correcto', () => {
    const menuButton = element.querySelector('.data-table__action-button') as HTMLButtonElement;

    menuButton.click();
    fixture.detectChanges();

    const actionButtons = element.querySelectorAll('.data-table__action-item');

    (actionButtons[0] as HTMLButtonElement).click();

    fixture.detectChanges();

    expect(host.editProduct).toHaveBeenCalledTimes(1);
    expect(host.editProduct).toHaveBeenCalledWith(host.products()[0]);

    expect(element.querySelector('.data-table__action-menu')).toBeNull();
  });

  it('debe ejecutar Eliminar con el producto correcto', () => {
    const menuButton = element.querySelector('.data-table__action-button') as HTMLButtonElement;

    menuButton.click();
    fixture.detectChanges();

    const actionButtons = element.querySelectorAll('.data-table__action-item');

    (actionButtons[1] as HTMLButtonElement).click();

    expect(host.deleteProduct).toHaveBeenCalledWith(host.products()[0]);
  });

  describe('menú de acciones', () => {
    const triggers = () =>
      element.querySelectorAll<HTMLButtonElement>('.data-table__action-button');
    const menu = () => element.querySelector<HTMLElement>('.data-table__action-menu');
    const items = () => element.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    const pressKey = (target: EventTarget, key: string) =>
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    async function openMenu(index = 0): Promise<HTMLButtonElement> {
      const trigger = triggers()[index];
      trigger.click();
      await fixture.whenStable();
      return trigger;
    }

    it('enfoca la primera opción al abrir y se cierra con Escape devolviendo el foco', async () => {
      const trigger = await openMenu();

      expect(menu()?.getAttribute('role')).toBe('menu');
      expect(document.activeElement).toBe(items()[0]);

      pressKey(document, 'Escape');
      await fixture.whenStable();

      expect(menu()).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('recorre las opciones con las flechas de forma circular', async () => {
      await openMenu();

      pressKey(items()[0], 'ArrowDown');
      expect(document.activeElement).toBe(items()[1]);

      pressKey(items()[1], 'ArrowDown');
      expect(document.activeElement).toBe(items()[0]);

      pressKey(items()[0], 'ArrowUp');
      expect(document.activeElement).toBe(items()[1]);

      pressKey(items()[1], 'Tab');
      expect(document.activeElement).toBe(items()[1]);
    });

    it('se cierra al pulsar de nuevo el botón o al desplazar la tabla', async () => {
      await openMenu();
      triggers()[0].click();
      await fixture.whenStable();
      expect(menu()).toBeNull();

      await openMenu();
      element.querySelector('.data-table__scroll')?.dispatchEvent(new Event('scroll'));
      await fixture.whenStable();
      expect(menu()).toBeNull();
    });

    it('no se cierra al hacer clic dentro del menú y muestra uno solo a la vez', async () => {
      await openMenu();
      menu()?.click();
      await fixture.whenStable();
      expect(menu()).not.toBeNull();

      await openMenu(1);
      expect(element.querySelectorAll('.data-table__action-menu')).toHaveLength(1);
      expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');
      expect(triggers()[1].getAttribute('aria-expanded')).toBe('true');
    });

    describe('posición', () => {
      const originalInnerHeight = window.innerHeight;
      const originalOffsetHeight = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'offsetHeight',
      ) as PropertyDescriptor;

      function mockLayout(triggerTop: number, viewportHeight: number, menuHeight: number): void {
        jest.spyOn(triggers()[0], 'getBoundingClientRect').mockReturnValue({
          top: triggerTop,
          bottom: triggerTop + 36,
          right: 300,
        } as DOMRect);
        jest.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(400);
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: viewportHeight });
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
          configurable: true,
          get: () => menuHeight,
        });
      }

      afterEach(() => {
        jest.restoreAllMocks();
        Object.defineProperty(window, 'innerHeight', {
          configurable: true,
          value: originalInnerHeight,
        });
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
      });

      it('se abre debajo del botón, alineado a su borde derecho', async () => {
        mockLayout(100, 800, 80);
        await openMenu();

        expect(menu()?.style.top).toBe('140px');
        expect(menu()?.style.right).toBe('100px');
      });

      it('se abre hacia arriba cuando no cabe debajo', async () => {
        mockLayout(700, 800, 80);
        await openMenu();

        expect(menu()?.style.top).toBe('616px');
      });

      it('se ajusta al borde de la ventana si no cabe ni arriba ni abajo', async () => {
        mockLayout(20, 100, 80);
        await openMenu();

        expect(menu()?.style.top).toBe('12px');
      });
    });
  });
});
