import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

// Componentes
import { DataTable } from '../../../../../shared/components/data-table/data-table';
import { ImageAvatar } from '../../../../../shared/components/image-avatar/image-avatar';
import { TableCellDirective } from '../../../../../shared/components/data-table/table-cell.directive';

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
    TableCellDirective,
    DatePipe
  ],
  templateUrl: './product-list-page.html',
  styleUrl: './product-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListPage {

  private readonly productRepository = inject(PRODUCT_REPOSITORY);
  readonly loadError = signal<string | null>(null);

  // Columnas
  readonly columns: TableColumn<Product>[] = [
    {
      key: 'logo',
      header: 'Logo',
      width: '12%'
    },
    {
      key: 'name',
      header: 'Nombre del producto',
      width: '22%'
    },
    {
      key: 'description',
      header: 'Descripción',
      width: '28%'
    },
    {
      key: 'date_release',
      header: 'Fecha de liberación',
      width: '19%'
    },
    {
      key: 'date_revision',
      header: 'Fecha de reestructuración',
      width: '19%'
    }
  ];

  // Acciones
  readonly tableActions: TableAction<Product>[] = [
    {
      label: 'Editar',
      icon: 'edit',
      execute: (product) => this.editProduct(product)
    },
    {
      label: 'Eliminar',
      icon: 'delete',
      execute: (product) => this.deleteProduct(product)
    }
  ];

  // Productos
  readonly products = toSignal(
    this.productRepository.getAll().pipe(
      catchError(error => {
        this.loadError.set(error instanceof HttpErrorResponse
          ? error.status === 0
            ? 'Error de conexión: no se pudo contactar con el servicio.'
            : `Error de servicio ${error.status}: no se pudieron cargar los productos.`
          : 'Error de servicio: no se pudieron cargar los productos.');

        return of([] as Product[]);
      })
    ),
    {
      initialValue: [] as Product[]
    }
  );

  
  editProduct(product: Product): void {
    console.log('Editar producto:', product);

    // TODO: Navegar al formulario de edición.
  }

  
  deleteProduct(product: Product): void {
    console.log('Eliminar producto:', product);

    // TODO: Confirmar la eliminación, llamar a la API y actualizar la lista.
  }
}
