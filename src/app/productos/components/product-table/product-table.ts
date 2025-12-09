import { Component, computed, input } from '@angular/core';
import { Product } from '../../interfaces/products-response.interface';
import { ProductImagePipe } from '../../pipes/product-image.pipe';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'product-table',
  imports: [ProductImagePipe, RouterLink, CurrencyPipe],
  templateUrl: './product-table.html',
})
export class ProductTable {
  products = input.required<Product[]>();
  searchTerm = input<string>('');

  newArrayProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.products();

    return this.products().filter(
      (product) =>
        product.title.toLowerCase().includes(term) ||
        product.slug.toLowerCase().includes(term) ||
        product.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  });
}
