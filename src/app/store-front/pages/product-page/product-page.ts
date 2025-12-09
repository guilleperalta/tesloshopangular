import { Component, inject } from '@angular/core'
import { ProductsService } from '../../../productos/services/product.service'
import { rxResource } from '@angular/core/rxjs-interop'
import { ActivatedRoute } from '@angular/router'
import { ProductCarousel } from '../../../productos/components/product-carousel/product-carousel'

@Component({
  selector: 'product-page',
  imports: [ProductCarousel],
  templateUrl: './product-page.html',
})
export class ProductPage {
  productsService = inject(ProductsService)

  idSlug = inject(ActivatedRoute).snapshot.params['idSlug'];

  productResource = rxResource({
    params: () => ({ idSlug: this.idSlug }),
    stream: ({ params }) => this.productsService.getProductByIdSlug(params.idSlug)
  })
}
