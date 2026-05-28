import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div
      class="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-white to-indigo-50/40"
    >
      <!-- Left: marketing -->
      <div class="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between">
        <div class="flex items-center gap-2 text-slate-900">
          <span
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md"
          >
            <app-icon name="check-circle" [size]="18" />
          </span>
          <span class="font-semibold text-lg">wibotodo</span>
        </div>

        <div class="space-y-5 max-w-md">
         
          <h1 class="text-4xl font-semibold text-slate-900 leading-tight">
            Stay on top of your day,<br />
            <span class="text-indigo-600">visually.</span>
          </h1>
          <p class="text-slate-600 leading-relaxed">
            A focused todo app with date filtering, image attachments, an analytics
            dashboard, and PDF/Excel export. Designed for clarity, built for speed.
          </p>

          <div class="grid grid-cols-2 gap-3 pt-4">
            <div class="bg-white border border-slate-200 rounded-xl p-3.5">
              <div class="flex items-center gap-2 text-emerald-600">
                <app-icon name="trend-up" [size]="16" />
                <span class="text-xs font-medium uppercase tracking-wide">Analytics</span>
              </div>
              <p class="text-sm text-slate-600 mt-1">KPIs + 7-day charts</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-3.5">
              <div class="flex items-center gap-2 text-indigo-600">
                <app-icon name="download" [size]="16" />
                <span class="text-xs font-medium uppercase tracking-wide">Export</span>
              </div>
              <p class="text-sm text-slate-600 mt-1">PDF & Excel reports</p>
            </div>
          </div>
        </div>

        <p class="text-xs text-slate-400">
          A product by
          <a
            href="https://wibosystems.com"
            target="_blank"
            rel="noopener"
            class="text-slate-600 hover:text-indigo-600 underline-offset-2 hover:underline"
          >Wibo Systems</a>
          — fullstack development for businesses that ship.
        </p>
      </div>

      <!-- Right: form -->
      <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md">
          <div class="lg:hidden flex items-center gap-2 text-slate-900 mb-8">
            <span
              class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md"
            >
              <app-icon name="check-circle" [size]="18" />
            </span>
            <span class="font-semibold text-lg">wibotodo</span>
          </div>

          <button
            type="button"
            (click)="tryDemo()"
            [disabled]="demoLoading()"
            class="w-full mb-5 p-4 bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-medium flex items-center justify-between shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span class="flex items-center gap-2.5">
              <span class="p-1.5 bg-white/15 rounded-lg">
                <app-icon name="play" [size]="14" />
              </span>
              <span class="text-left">
                <span class="block text-sm font-semibold">{{ demoLoading() ? 'Loading demo…' : 'Try the demo' }}</span>
                <span class="block text-xs text-indigo-100/90">Instant login — no signup needed</span>
              </span>
            </span>
            <app-icon name="trend-up" [size]="16" />
          </button>

          <div class="flex items-center gap-3 mb-5">
            <div class="flex-1 h-px bg-slate-200"></div>
            <span class="text-xs text-slate-400 uppercase tracking-wide">or sign in</span>
            <div class="flex-1 h-px bg-slate-200"></div>
          </div>

          @if (googleAuth.isConfigured) {
            <div class="mb-5">
              <div #googleBtn class="flex justify-center min-h-[44px]"></div>
              @if (googleLoading()) {
                <p class="text-xs text-slate-500 text-center mt-2">Signing in with Google…</p>
              }
            </div>

            <div class="flex items-center gap-3 mb-5">
              <div class="flex-1 h-px bg-slate-200"></div>
              <span class="text-xs text-slate-400 uppercase tracking-wide">or with email</span>
              <div class="flex-1 h-px bg-slate-200"></div>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                formControlName="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

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
              {{ loading() ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>

          <p class="text-sm text-slate-500 text-center mt-6">
            Don't have an account?
            <a routerLink="/register" class="text-indigo-600 font-medium hover:underline">
              Create one
            </a>
          </p>

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
    </div>
  `,
})
export class LoginComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly googleAuth = inject(GoogleAuthService);

  readonly loading = signal(false);
  readonly demoLoading = signal(false);
  readonly googleLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly googleBtn = viewChild<ElementRef<HTMLDivElement>>('googleBtn');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngAfterViewInit() {
    if (!this.googleAuth.isConfigured) return;
    const host = this.googleBtn()?.nativeElement;
    if (!host) return;
    this.googleAuth
      .renderButton(host, (credential) => this.onGoogleCredential(credential), 'signin_with')
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
        this.error.set(err.error?.message ?? 'Google sign-in failed');
      },
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/todos']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Login failed');
      },
    });
  }

  tryDemo() {
    this.demoLoading.set(true);
    this.error.set(null);
    this.auth.demo().subscribe({
      next: () => {
        this.demoLoading.set(false);
        this.router.navigate(['/todos']);
      },
      error: (err: HttpErrorResponse) => {
        this.demoLoading.set(false);
        this.error.set(err.error?.message ?? 'Demo login failed');
      },
    });
  }
}
