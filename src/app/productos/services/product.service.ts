import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import {
  Gender,
  type Product,
  type ProductsResponse,
} from '../interfaces/products-response.interface'
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs'
import { environment } from '../../../environments/environment'
import { User } from '../../auth/interfaces/user.interface'

const baseUrl = environment.baseUrl

interface Options {
  limit?: number
  offset?: number
  gender?: string
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User,
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient)
  private productsCache = new Map<string, Observable<ProductsResponse>>()
  private productCache = new Map<string, Observable<Product>>()

  getProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 6, offset = 0, gender = '' } = options
    const key = `${limit}-${offset}-${gender}`

    // console.log(this.productsCache.entries())

    if (this.productsCache.has(key)) {
      console.log('Returning products from cache:', key)
      return this.productsCache.get(key)!
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
        tap(response => this.productsCache.set(key, of(response)))
      )
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    if (this.productCache.has(idSlug)) {
      // console.log('Returning product from cache:', idSlug);
      return this.productCache.get(idSlug)!
    }

    return this.http.get<Product>(`${baseUrl}/products/${idSlug}`).pipe(
      // tap(response => console.log(response)),
      tap(response => this.productCache.set(idSlug, of(response)))
    )
  }

  getProductById(id: string): Observable<Product> {
    if (id === 'new') {
      return of(emptyProduct)
    }

    if (this.productCache.has(id)) {
      // console.log('Returning product from cache:', id);
      return this.productCache.get(id)!
    }

    return this.http.get<Product>(`${baseUrl}/products/${id}`).pipe(
      // tap(response => console.log(response)),
      tap(response => this.productCache.set(id, of(response)))
    )
  }

  updateProduct(
    id: string,
    productLike: Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product> {
    const currentImages = productLike.images || []

    return this.uploadImages(imageFileList).pipe(
      map(imageNames => ({
        ...productLike,
        images: [...currentImages, ...imageNames],
      })),
      switchMap(updatedProduct =>
        this.http
          .patch<Product>(`${baseUrl}/products/${id}`, updatedProduct)
          .pipe(tap(updatedProduct => this.updateProductCache(updatedProduct)))
      ),
      tap(product => this.updateProductCache(product))
    )
  }

  updateProductCache(product: Product) {
    const productId = product.id

    this.productCache.set(productId, of(product))

    this.productsCache.forEach((cachedObservable, key) => {
      cachedObservable
        .subscribe(currentValue => {
          const updatedResponse: ProductsResponse = {
            count: currentValue.count,
            pages: currentValue.pages,
            products: currentValue.products.map(currentProduct =>
              currentProduct.id === productId ? product : currentProduct
            ),
          }
          this.productsCache.set(key, of(updatedResponse))
        })
        .unsubscribe()
    })
  }

  createProduct(
    productLike: Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product> {
    return this.http
      .post<Product>(`${baseUrl}/products`, productLike)
      .pipe(tap(newProduct => this.updateProductCache(newProduct)))
  }

  uploadImages(images: FileList | undefined): Observable<string[]> {
    if (!images) return of([])
    const uploadObservables = Array.from(images).map(imageFile =>
      this.uploadImage(imageFile)
    )
    return forkJoin(uploadObservables)
  }

  uploadImage(imageFile: File): Observable<string> {
    const formData = new FormData()
    formData.append('file', imageFile)

    return this.http
      .post<{ fileName: string }>(`${baseUrl}/files/product`, formData)
      .pipe(map(response => response.fileName))
  }
}
