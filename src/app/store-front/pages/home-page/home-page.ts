import { Component, inject } from '@angular/core'
import { ProductCard } from "../../../productos/components/product-card/product-card"
import { ProductsService } from '../../../productos/services/product.service'
import { rxResource } from '@angular/core/rxjs-interop'
import { Pagination } from "../../../shared/components/pagination/pagination"
import { PaginationService } from '../../../shared/components/pagination/pagination.service'

@Component({
  selector: 'home-page',
  imports: [ProductCard, Pagination],
  templateUrl: './home-page.html',
})
export class HomePage {
  productsService = inject(ProductsService)
  paginationService = inject(PaginationService)

  productsResource = rxResource({
    params: () => ({ page: this.paginationService.currentPage() }),
    stream: ({ params }) => {
      return this.productsService.getProducts({
        offset: (params.page - 1) * 8,
        limit: 8,
      })
    },
  })

}
