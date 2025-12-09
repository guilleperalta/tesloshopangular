import { Component, input } from '@angular/core'
import { RouterLink } from "@angular/router"
import { Product } from '../../interfaces/products-response.interface'
import { SlicePipe } from '@angular/common'
import { ProductImagePipe } from '../../pipes/product-image.pipe'

@Component({
  selector: 'product-card',
  imports: [RouterLink, SlicePipe, ProductImagePipe],
  templateUrl: './product-card.html',
})
export class ProductCard {
  product = input.required<Product>()
}
