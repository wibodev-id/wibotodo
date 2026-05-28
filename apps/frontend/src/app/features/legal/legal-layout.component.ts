import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-legal-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <header class="bg-white border-b border-slate-200/80">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2 text-slate-900 hover:opacity-80 transition">
            <span
              class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md"
            >
              <app-icon name="check-circle" [size]="18" />
            </span>
            <span class="font-semibold text-base">wibotodo</span>
          </a>
          <a
            routerLink="/login"
            class="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Back to app →
          </a>
        </div>
      </header>

      <main class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8 sm:p-10">
          <h1 class="text-3xl font-semibold text-slate-900 mb-2">{{ title }}</h1>
          <p class="text-sm text-slate-500 mb-8">Last updated: {{ lastUpdated }}</p>
          <div class="prose prose-slate max-w-none text-slate-700 leading-relaxed">
            <ng-content />
          </div>
        </div>

        <div class="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
          <a routerLink="/terms" class="hover:text-slate-600 transition">Terms of Service</a>
          <a routerLink="/privacy" class="hover:text-slate-600 transition">Privacy Policy</a>
          <a
            href="https://wibosystems.com"
            target="_blank"
            rel="noopener"
            class="hover:text-slate-600 transition"
          >
            wibosystems.com
          </a>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep h2 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #0f172a;
        margin-top: 2rem;
        margin-bottom: 0.5rem;
      }
      :host ::ng-deep h2:first-child {
        margin-top: 0;
      }
      :host ::ng-deep p {
        margin-bottom: 0.875rem;
      }
      :host ::ng-deep ul {
        list-style: disc;
        padding-left: 1.25rem;
        margin-bottom: 0.875rem;
      }
      :host ::ng-deep li {
        margin-bottom: 0.25rem;
      }
      :host ::ng-deep a {
        color: #4f46e5;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      :host ::ng-deep strong {
        color: #0f172a;
        font-weight: 600;
      }
    `,
  ],
})
export class LegalLayoutComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) lastUpdated!: string;
}
