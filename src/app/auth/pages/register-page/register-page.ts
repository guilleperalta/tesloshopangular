import { Component, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from "@angular/router"
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'register-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  formBuilder = inject(FormBuilder)
  hasError = signal(false)
  isPosting = signal(false)
  router = inject(Router)

  authService = inject(AuthService)

  registerForm = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(4)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.hasError.set(true)
      setTimeout(() => this.hasError.set(false), 4000)
      return
    }

    const { email = '', password = '', fullName = '' } = this.registerForm.value

    this.authService
      .register(fullName!, email!, password!)
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigateByUrl('/')
        }
        this.hasError.set(true)
        setTimeout(() => this.hasError.set(false), 4000)
        return
      })
  }
}
