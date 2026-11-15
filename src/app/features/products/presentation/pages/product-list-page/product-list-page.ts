import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

// Componentes
import { DataTable } from '../../../../../shared/components/data-table/data-table';
import { ImageAvatar } from '../../../../../shared/components/image-avatar/image-avatar';
import { TableCellDirective } from '../../../../../shared/components/data-table/table-cell.directive';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { CustomButton } from '../../../../../shared/components/custom-button/custom-button';

// Modelos de tabla
import { TableColumn } from '../../../../../shared/components/data-table/models/table-column.model';
import { TableAction } from '../../../../../shared/components/data-table/models/table-action.model';

// Dominio
import { Product } from '../../../domain/models/product.model';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/product-repository.token';

@Component({
  selector: 'app-product-list-page',
  imports: [
    DataTable,
    ImageAvatar,
    InputField,
    CustomButton,
    RouterLink,
    TableCellDirective,
    DatePipe,
  ],
  templateUrl: './product-list-page.html',
  styleUrl: './product-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPage {
  private readonly productRepository = inject(PRODUCT_REPOSITORY);

  // Estado
  readonly loadError = signal<string | null>(null);
  readonly searchTerm = signal('');

  // Columnas
  readonly columns: TableColumn<Product>[] = [
    { key: 'logo', header: 'Logo', width: '12%' },
    { key: 'name', header: 'Nombre del producto', width: '22%' },
    { key: 'description', header: 'Descripción', width: '28%' },
    { key: 'date_release', header: 'Fecha de liberación', width: '19%' },
    { key: 'date_revision', header: 'Fecha de reestructuración', width: '19%' },
  ];

  // Acciones
  readonly tableActions: TableAction<Product>[] = [
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

  // Productos
  readonly products = toSignal(
    this.productRepository.getAll().pipe(
      catchError((error: unknown) => {
        this.loadError.set(this.getErrorMessage(error));
        return of([] as Product[]);
      }),
    ),
    { initialValue: [] as Product[] },
  );

  // Filtro de búsqueda
  readonly filteredProducts = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    if (!search) {
      return this.products();
    }

    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.id.toLowerCase().includes(search),
    );
  });

  // Errores del servicio
  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Error de conexión: no se pudo contactar con el servicio.';
      }

      return `Error de servicio ${error.status}: no se pudieron cargar los productos.`;
    }

    return 'Error de servicio: no se pudieron cargar los productos.';
  }

  // TODO: Navegar al formulario de edición.
  editProduct(product: Product): void {
    console.log('Editar:', product);
  }

  // TODO: Confirmar y eliminar el producto.
  deleteProduct(product: Product): void {
    console.log('Eliminar:', product);
  }
}
