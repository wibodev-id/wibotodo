import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div class="w-full max-w-md">
        <div class="flex items-center gap-2 text-slate-900 mb-8 justify-center">
          <span
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md"
          >
            <app-icon name="check-circle" [size]="18" />
          </span>
          <span class="font-semibold text-lg">wibotodo</span>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8">
          <h1 class="text-2xl font-semibold text-slate-900 mb-1">Create your account</h1>
          <p class="text-sm text-slate-500 mb-6">Start tracking your todos in seconds.</p>

          @if (googleAuth.isConfigured) {
            <div class="mb-5">
              <div #googleBtn class="flex justify-center min-h-[44px]"></div>
              @if (googleLoading()) {
                <p class="text-xs text-slate-500 text-center mt-2">Signing up with Google…</p>
              }
              <p class="text-[11px] text-slate-400 text-center mt-2 leading-relaxed">
                By continuing with Google, you agree to our
                <a routerLink="/terms" class="text-slate-500 hover:underline">Terms</a>
                and
                <a routerLink="/privacy" class="text-slate-500 hover:underline">Privacy Policy</a>.
              </p>
            </div>

            <div class="flex items-center gap-3 mb-5">
              <div class="flex-1 h-px bg-slate-200"></div>
              <span class="text-xs text-slate-400 uppercase tracking-wide">or with email</span>
              <div class="flex-1 h-px bg-slate-200"></div>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Name (optional)</label>
              <input
                type="text"
                formControlName="name"
                autocomplete="name"
                placeholder="Arif"
                class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                formControlName="password"
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <p class="text-xs text-slate-500 mt-1.5">At least 8 characters.</p>
            </div>

            <label class="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                formControlName="agreedToTerms"
                class="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span class="leading-relaxed">
                I agree to wibotodo's
                <a routerLink="/terms" class="text-indigo-600 hover:underline">Terms of Service</a>
                and
                <a routerLink="/privacy" class="text-indigo-600 hover:underline">Privacy Policy</a>.
              </span>
            </label>

            @if (error()) {
              <div
                class="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 flex items-start gap-2"
              >
                <app-icon name="alert-triangle" [size]="16" />
                <span>{{ error() }}</span>
              </div>
            }

            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {{ loading() ? 'Creating account…' : 'Create account' }}
            </button>
          </form>

          <p class="text-sm text-slate-500 text-center mt-6">
            Already have an account?
            <a routerLink="/login" class="text-indigo-600 font-medium hover:underline">Sign in</a>
          </p>
        </div>

        <div class="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
          <a routerLink="/terms" class="hover:text-slate-600 transition">Terms</a>
          <span aria-hidden="true">·</span>
          <a routerLink="/privacy" class="hover:text-slate-600 transition">Privacy</a>
          <span aria-hidden="true">·</span>
          <a
            href="https://wibosystems.com"
            target="_blank"
            rel="noopener"
            class="hover:text-slate-600 transition"
          >
            wibosystems.com
          </a>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly googleAuth = inject(GoogleAuthService);

  readonly loading = signal(false);
  readonly googleLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly googleBtn = viewChild<ElementRef<HTMLDivElement>>('googleBtn');

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    agreedToTerms: [false, Validators.requiredTrue],
  });

  ngAfterViewInit() {
    if (!this.googleAuth.isConfigured) return;
    const host = this.googleBtn()?.nativeElement;
    if (!host) return;
    this.googleAuth
      .renderButton(host, (credential) => this.onGoogleCredential(credential), 'signup_with')
      .catch(() => this.error.set('Failed to load Google sign-in'));
  }

  private onGoogleCredential(credential: string) {
    this.googleLoading.set(true);
    this.error.set(null);
    this.auth.googleLogin(credential).subscribe({
      next: () => {
        this.googleLoading.set(false);
        this.router.navigate(['/todos']);
      },
      error: (err: HttpErrorResponse) => {
        this.googleLoading.set(false);
        this.error.set(err.error?.message ?? 'Google sign-up failed');
      },
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const payload = {
      email: raw.email,
      password: raw.password,
      ...(raw.name ? { name: raw.name } : {}),
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/todos']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err.error?.message;
        this.error.set(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Registration failed');
      },
    });
  }
}
