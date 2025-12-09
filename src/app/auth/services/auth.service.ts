import { computed, inject, Injectable, signal } from '@angular/core'
import { User } from '../interfaces/user.interface'
import { HttpClient } from '@angular/common/http'
import { catchError, map, Observable, of, tap } from 'rxjs'
import { environment } from '../../../environments/environment'
import { AuthResponse } from '../interfaces/auth-response.interface'
import { rxResource } from '@angular/core/rxjs-interop'

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated'

const baseUrl = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authStatus = signal<AuthStatus>('checking')
  private _user = signal<User | null>(null)
  private _token = signal<string | null>(localStorage.getItem('token'))

  private http = inject(HttpClient)

  checkStatusResourse = rxResource({
    stream: () => this.chechStatus()
  })

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking'
    return this._user() ? 'authenticated' : 'not-authenticated'
  })

  user = computed<User | null>(() => this._user())
  token = computed<string | null>(() => this._token())
  isAdmin = computed<boolean>(() => this._user()?.roles.includes('admin') ?? false)

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, {
      email: email,
      password: password
    })
      .pipe(
        tap((resp) => this.handleAuthSuccess(resp)),
        map(() => true),
        catchError((error: any) => this.handleAuthError(error))
      )
  }

  register(fullName: string, email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/register`, {
      fullName: fullName,
      email: email,
      password: password
    })
      .pipe(
        tap((resp) => this.handleAuthSuccess(resp)),
        map(() => true),
        catchError((error: any) => this.handleAuthError(error))
      )
  }

  chechStatus(): Observable<boolean> {
    const token = localStorage.getItem('token')
    if (!token) {
      this.logout()
      return of(false)
    }
    return this.http.get<AuthResponse>(`${baseUrl}/auth/check-status`, {
      // headers: {
      //   'Authorization': `Bearer ${token}`
      // }
    })
      .pipe(
        tap((resp) => this.handleAuthSuccess(resp)),
        map(() => true),
        catchError((error: any) => this.handleAuthError(error))
      )
  }

  logout(): void {
    this._authStatus.set('not-authenticated')
    this._user.set(null)
    this._token.set(null)

    localStorage.removeItem('token')
  }

  private handleAuthSuccess({ user, token }: AuthResponse): void {
    this._authStatus.set('authenticated')
    this._user.set(user)
    this._token.set(token)

    localStorage.setItem('token', token)
  }

  private handleAuthError(error: any): Observable<boolean> {
    this.logout()
    return of(false)
  }
}
