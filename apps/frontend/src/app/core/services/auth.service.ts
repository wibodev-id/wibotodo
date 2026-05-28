import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '../models/auth.model';

const TOKEN_KEY = 'wibotodo.token';
const USER_KEY = 'wibotodo.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/auth`;

  private readonly userSignal = signal<AuthUser | null>(this.loadUser());
  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${this.api}/login`, payload).pipe(
      tap((res) => this.persistSession(res)),
    );
  }

  register(payload: RegisterPayload) {
    return this.http.post<AuthResponse>(`${this.api}/register`, payload).pipe(
      tap((res) => this.persistSession(res)),
    );
  }

  demo() {
    return this.http.post<AuthResponse>(`${this.api}/demo`, {}).pipe(
      tap((res) => this.persistSession(res)),
    );
  }

  googleLogin(credential: string) {
    return this.http.post<AuthResponse>(`${this.api}/google`, { credential }).pipe(
      tap((res) => this.persistSession(res)),
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  private persistSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.tokenSignal.set(res.token);
    this.userSignal.set(res.user);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
