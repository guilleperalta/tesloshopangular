import { Component, inject } from '@angular/core'
import { rxResource, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute } from '@angular/router'
import { map } from 'rxjs'
import { ProductsService } from '../../../productos/services/product.service'
import { ProductCard } from "../../../productos/components/product-card/product-card"
import { PaginationService } from '../../../shared/components/pagination/pagination.service'
import { Pagination } from "../../../shared/components/pagination/pagination"

@Component({
  selector: 'gender-page',
  imports: [ProductCard, Pagination],
  templateUrl: './gender-page.html',
})
export class GenderPage {
  productsService = inject(ProductsService)
  paginationService = inject(PaginationService)
  route = inject(ActivatedRoute);

  gender = toSignal(
    this.route.params.pipe(
      map(({ gender }) => gender)
    )
  );

  productsResource = rxResource({
    params: () => ({ gender: this.gender(), page: this.paginationService.currentPage() }),
    stream: ({ params }) => {
      return this.productsService.getProducts({
        gender: params.gender,
        offset: (params.page - 1) * 8,
        limit: 8,
      })
    },
  })
}
