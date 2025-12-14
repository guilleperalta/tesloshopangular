import { Component, computed, inject, input, OnInit, signal } from '@angular/core'
import { Product } from '../../../../productos/interfaces/products-response.interface'
import { ProductCarousel } from '../../../../productos/components/product-carousel/product-carousel'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { FormUtils } from '../../../../utils/form-utils'
import { FormErrorLabel } from '../../../../shared/components/form-error-label/form-error-label'
import { ProductsService } from '../../../../productos/services/product.service'
import { Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'

@Component({
  selector: 'product-details',
  imports: [ProductCarousel, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit {
  product = input.required<Product>()
  formBuilder = inject(FormBuilder)
  productService = inject(ProductsService)
  router = inject(Router)
  wasSaved = signal(false)
  tempImages = signal<string[]>([])
  imageFileList: FileList | undefined = undefined

  imagesCarousel = computed(() => {
    const currentProductImages = this.product().images || []
    const tempImages = this.tempImages()
    return [...tempImages, ...currentProductImages]
  })

  productForm = this.formBuilder.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    sizes: [['']],
    images: [[]],
    tags: [''],
    gender: ['unisex', [Validators.required, Validators.pattern(/men|women|kid|unisex/)]],
  })

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  ngOnInit() {
    this.setFormValue(this.product())
  }

  setFormValue(FormLike: Partial<Product>) {
    // this.productForm.patchValue(FormLike as any);
    this.productForm.reset(this.product() as any)
    this.productForm.patchValue({ tags: (FormLike.tags || []).join(', ') })
  }

  onSizeClick(size: string) {
    const currentSizes: string[] = this.productForm.value.sizes ?? []
    if (currentSizes.includes(size)) {
      currentSizes.splice(currentSizes.indexOf(size), 1)
    } else {
      currentSizes.push(size)
    }
    this.productForm.patchValue({ sizes: currentSizes })
  }

  async onSubmit() {
    const isValid = this.productForm.valid
    this.productForm.markAllAsTouched()
    if (!isValid) return
    const formValue = this.productForm.value

    const productLike: Partial<Product> = {
      ...(formValue as any),
      tags: formValue.tags?.split(',').map(tag => tag.trim().toLowerCase()) || [],
    }

    if (this.product().id === 'new') {
      const product = await firstValueFrom(this.productService.createProduct(productLike, this.imageFileList))
      this.router.navigateByUrl(`/admin/product/${product.id}`)
      return
    } else {
      await firstValueFrom(this.productService.updateProduct(this.product().id, productLike, this.imageFileList))
    }

    this.wasSaved.set(true)
    setTimeout(() => this.wasSaved.set(false), 3000)
  }

  onFilesChanged(event: Event) {
    const files = (event.target as HTMLInputElement).files
    this.imageFileList = files ?? undefined
    const imageUrls = Array.from(files ?? []).map(file => URL.createObjectURL(file))
    this.tempImages.set(imageUrls)
  }
}
