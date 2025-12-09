import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Product, ProductsResponse } from '../interfaces/products-response.interface';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const baseUrl = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private productsCache = new Map<string, Observable<ProductsResponse>>();
  private productCache = new Map<string, Observable<Product>>();

  getProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 6, offset = 0, gender = '' } = options;
    const key = `${limit}-${offset}-${gender}`;

    // console.log(this.productsCache.entries())

    if (this.productsCache.has(key)) {
      console.log('Returning products from cache:', key);
      return this.productsCache.get(key)!;
    }

    return this.http
      .get<ProductsResponse>(`${baseUrl}/products`, {
        params: {
          limit,
          offset,
          gender,
        },
      })
      .pipe(
        // tap(response => console.log(response)),
        tap((response) => this.productsCache.set(key, of(response)))
      );
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    if (this.productCache.has(idSlug)) {
      // console.log('Returning product from cache:', idSlug);
      return this.productCache.get(idSlug)!;
    }

    return this.http.get<Product>(`${baseUrl}/products/${idSlug}`).pipe(
      // tap(response => console.log(response)),
      tap((response) => this.productCache.set(idSlug, of(response)))
    );
  }
}
