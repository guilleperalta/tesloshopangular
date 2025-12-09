import { Component, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from "@angular/router"
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'login-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.html',
})
export class LoginPage {
  formBuilder = inject(FormBuilder)
  hasError = signal(false)
  isPosting = signal(false)
  router = inject(Router)

  authService = inject(AuthService)

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.hasError.set(true)
      setTimeout(() => this.hasError.set(false), 4000)
      return
    }

    const { email = '', password = '' } = this.loginForm.value

    this.authService
      .login(email!, password!)
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
