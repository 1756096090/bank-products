import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

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
import { ProductService } from '../../../application/product.service';

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
  private readonly productsService = inject(ProductService);
  private readonly router = inject(Router);

  // Estado
  readonly loadError = signal<string | null>(null);
  readonly searchTerm = signal('');

  // Columnas
  readonly columns: TableColumn<Product>[] = [
    { key: 'logo', header: 'Logo', width: '12%' },
    { key: 'name', header: 'Nombre del producto', width: '22%' },
    { key: 'description', header: 'Descripción', width: '28%' },
    { key: 'dateRelease', header: 'Fecha de liberación', width: '19%' },
    { key: 'dateRevision', header: 'Fecha de reestructuración', width: '19%' },
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
    this.productsService.getAll().pipe(
      catchError((error: unknown) => {
        this.loadError.set(this.productsService.errorMessage(error, 'list'));
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

  editProduct(product: Product): void {
    void this.router.navigate(['/products', product.id, 'edit']);
  }

  // TODO: Confirmar y eliminar el producto.
  deleteProduct(product: Product): void {
    console.log('Eliminar:', product);
  }
}
