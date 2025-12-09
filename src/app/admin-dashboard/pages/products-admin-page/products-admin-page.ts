import { Component, inject, signal } from '@angular/core';
import { ProductTable } from '../../../productos/components/product-table/product-table';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductsService } from '../../../productos/services/product.service';
import { PaginationService } from '../../../shared/components/pagination/pagination.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'products-admin-page',
  imports: [ProductTable, Pagination, RouterLink],
  templateUrl: './products-admin-page.html',
})
export class ProductsAdminPage {
  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);
  router = inject(Router);

  searchTerm = signal('');

  productPerPage = signal(10);

  productsResource = rxResource({
    params: () => ({ page: this.paginationService.currentPage(), limit: this.productPerPage() }),
    stream: ({ params }) => {
      return this.productsService.getProducts({
        offset: (params.page - 1) * params.limit,
        limit: params.limit,
      });
    },
  });

  onPerPageChange(value: number) {
    this.productPerPage.set(value);
    this.router.navigate([], { queryParams: { page: 1 } });
  }
}
