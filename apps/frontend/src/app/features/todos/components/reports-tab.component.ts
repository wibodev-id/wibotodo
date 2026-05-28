import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Todo } from '../../../core/models/todo.model';
import {
  ExportDateField,
  ExportRange,
  ExportService,
} from '../../../core/services/export.service';
import { IconComponent } from '../../../shared/icon.component';

type Preset = 'all' | 'today' | 'week' | 'month' | 'custom';

@Component({
  selector: 'app-reports-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, IconComponent],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Controls panel -->
      <div class="lg:col-span-1 space-y-4">
        <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-5">
          <div class="flex items-center gap-2 text-slate-900">
            <app-icon name="filter" [size]="14" />
            <h3 class="text-sm font-semibold">Report filters</h3>
          </div>

          <!-- Field selector -->
          <div>
            <label class="block text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
              Filter by
            </label>
            <div class="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                (click)="setField('createdAt')"
                class="px-2 py-1.5 text-xs rounded-lg border transition"
                [class.bg-indigo-50]="field() === 'createdAt'"
                [class.text-indigo-700]="field() === 'createdAt'"
                [class.border-indigo-200]="field() === 'createdAt'"
                [class.font-medium]="field() === 'createdAt'"
                [class.bg-white]="field() !== 'createdAt'"
                [class.text-slate-600]="field() !== 'createdAt'"
                [class.border-slate-200]="field() !== 'createdAt'"
                [class.hover:bg-slate-50]="field() !== 'createdAt'"
              >
                Created
              </button>
              <button
                type="button"
                (click)="setField('dueDate')"
                class="px-2 py-1.5 text-xs rounded-lg border transition"
                [class.bg-indigo-50]="field() === 'dueDate'"
                [class.text-indigo-700]="field() === 'dueDate'"
                [class.border-indigo-200]="field() === 'dueDate'"
                [class.font-medium]="field() === 'dueDate'"
                [class.bg-white]="field() !== 'dueDate'"
                [class.text-slate-600]="field() !== 'dueDate'"
                [class.border-slate-200]="field() !== 'dueDate'"
                [class.hover:bg-slate-50]="field() !== 'dueDate'"
              >
                Due date
              </button>
              <button
                type="button"
                (click)="setField('completedAt')"
                class="px-2 py-1.5 text-xs rounded-lg border transition"
                [class.bg-indigo-50]="field() === 'completedAt'"
                [class.text-indigo-700]="field() === 'completedAt'"
                [class.border-indigo-200]="field() === 'completedAt'"
                [class.font-medium]="field() === 'completedAt'"
                [class.bg-white]="field() !== 'completedAt'"
                [class.text-slate-600]="field() !== 'completedAt'"
                [class.border-slate-200]="field() !== 'completedAt'"
                [class.hover:bg-slate-50]="field() !== 'completedAt'"
              >
                Completed
              </button>
            </div>
          </div>

          <!-- Presets -->
          <div>
            <label class="block text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
              Quick range
            </label>
            <div class="grid grid-cols-2 gap-1.5">
              @for (p of presets; track p.value) {
                <button
                  type="button"
                  (click)="applyPreset(p.value)"
                  class="px-2 py-1.5 text-xs rounded-lg border transition"
                  [class.bg-slate-900]="preset() === p.value"
                  [class.text-white]="preset() === p.value"
                  [class.border-slate-900]="preset() === p.value"
                  [class.bg-white]="preset() !== p.value"
                  [class.text-slate-700]="preset() !== p.value"
                  [class.border-slate-200]="preset() !== p.value"
                  [class.hover:bg-slate-50]="preset() !== p.value"
                >
                  {{ p.label }}
                </button>
              }
            </div>
          </div>

          <!-- Custom range -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">From</label>
              <input
                type="date"
                [(ngModel)]="fromDate"
                (ngModelChange)="onManualChange()"
                class="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">To</label>
              <input
                type="date"
                [(ngModel)]="toDate"
                (ngModelChange)="onManualChange()"
                class="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          @if (fromDate || toDate) {
            <button
              type="button"
              (click)="clearRange()"
              class="text-xs text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
            >
              Clear range
            </button>
          }
        </div>

        <!-- Download actions -->
        <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-3">
          <div class="flex items-center gap-2 text-slate-900">
            <app-icon name="download" [size]="14" />
            <h3 class="text-sm font-semibold">Download</h3>
          </div>
          <button
            type="button"
            (click)="exportPdf()"
            [disabled]="filteredCount() === 0 || busy()"
            class="w-full px-3 py-2.5 text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
          >
            <app-icon name="file-text" [size]="16" />
            Download PDF
          </button>
          <button
            type="button"
            (click)="exportExcel()"
            [disabled]="filteredCount() === 0 || busy()"
            class="w-full px-3 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2 shadow-sm"
          >
            <app-icon name="sheet" [size]="16" />
            Download Excel
          </button>
          @if (filteredCount() === 0) {
            <p class="text-xs text-slate-500 text-center">No todos match the selected range</p>
          }
        </div>
      </div>

      <!-- Preview panel -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Summary -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white border border-slate-200/80 rounded-xl p-4">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Items</p>
            <p class="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">
              {{ filteredCount() }}
            </p>
            <p class="text-xs text-slate-500 mt-0.5">of {{ todos.length }} total</p>
          </div>
          <div class="bg-white border border-slate-200/80 rounded-xl p-4">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Completed</p>
            <p class="mt-1 text-2xl font-semibold text-emerald-600 tabular-nums">
              {{ completedCount() }}
            </p>
            <p class="text-xs text-slate-500 mt-0.5">{{ completionRate() }}% rate</p>
          </div>
          <div class="bg-white border border-slate-200/80 rounded-xl p-4">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Open</p>
            <p class="mt-1 text-2xl font-semibold text-indigo-600 tabular-nums">
              {{ openCount() }}
            </p>
            <p class="text-xs text-slate-500 mt-0.5">{{ rangeSummary() }}</p>
          </div>
        </div>

        <!-- Preview list -->
        <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div class="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-900">Preview</h3>
            <p class="text-xs text-slate-500">{{ rangeSummary() }}</p>
          </div>
          @if (filtered().length === 0) {
            <div class="text-center py-16">
              <div class="inline-flex p-3 bg-slate-100 rounded-2xl text-slate-400 mb-3">
                <app-icon name="filter" [size]="20" />
              </div>
              <p class="text-sm font-medium text-slate-700">No todos match this range</p>
              <p class="text-xs text-slate-500 mt-1">Try a wider date window or different field.</p>
            </div>
          } @else {
            <div class="divide-y divide-slate-100">
              @for (todo of preview(); track todo.id) {
                <div class="px-5 py-3 flex items-start gap-3">
                  <span
                    class="mt-1 inline-flex p-1.5 rounded-md"
                    [class.bg-emerald-50]="todo.isCompleted"
                    [class.text-emerald-600]="todo.isCompleted"
                    [class.bg-slate-100]="!todo.isCompleted"
                    [class.text-slate-400]="!todo.isCompleted"
                  >
                    <app-icon
                      [name]="todo.isCompleted ? 'check-circle' : 'circle'"
                      [size]="12"
                    />
                  </span>
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-medium text-slate-900 truncate"
                      [class.line-through]="todo.isCompleted"
                      [class.text-slate-500]="todo.isCompleted"
                    >
                      {{ todo.title }}
                    </p>
                    <div class="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                      @if (todo.dueDate) {
                        <span>📅 due {{ todo.dueDate | date: 'd MMM HH:mm' }}</span>
                      }
                      @if (todo.completedAt) {
                        <span class="text-emerald-600">
                          ✓ done {{ todo.completedAt | date: 'd MMM HH:mm' }}
                        </span>
                      }
                      <span>created {{ todo.createdAt | date: 'd MMM' }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
            @if (filtered().length > preview().length) {
              <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                Showing first {{ preview().length }} of {{ filtered().length }} — full list is in the export.
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class ReportsTabComponent {
  private readonly exportService = inject(ExportService);

  @Input() todos: Todo[] = [];

  readonly presets: { value: Preset; label: string }[] = [
    { value: 'all', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 days' },
    { value: 'month', label: 'This month' },
  ];

  fromDate = '';
  toDate = '';

  readonly field = signal<ExportDateField>('createdAt');
  readonly preset = signal<Preset>('all');
  readonly busy = signal(false);

  readonly range = computed<ExportRange>(() => ({
    field: this.field(),
    from: this.fromDate ? this.startOfDay(new Date(this.fromDate)) : null,
    to: this.toDate ? this.endOfDay(new Date(this.toDate)) : null,
  }));

  readonly filtered = computed(() => this.exportService.filterByRange(this.todos, this.range()));
  readonly filteredCount = computed(() => this.filtered().length);
  readonly completedCount = computed(() => this.filtered().filter((t) => t.isCompleted).length);
  readonly openCount = computed(() => this.filtered().filter((t) => !t.isCompleted).length);
  readonly completionRate = computed(() => {
    const total = this.filteredCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });
  readonly preview = computed(() => this.filtered().slice(0, 10));
  readonly rangeSummary = computed(() => this.exportService.describeRange(this.range()));

  setField(value: ExportDateField) {
    this.field.set(value);
  }

  applyPreset(p: Preset) {
    this.preset.set(p);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let from: Date | null = null;
    if (p === 'today') from = start;
    if (p === 'week') from = new Date(start.getTime() - 6 * 24 * 60 * 60 * 1000);
    if (p === 'month') from = new Date(start.getFullYear(), start.getMonth(), 1);

    this.fromDate = from ? this.toIso(from) : '';
    this.toDate = p === 'all' ? '' : this.toIso(today);
  }

  onManualChange() {
    this.preset.set('custom');
  }

  clearRange() {
    this.fromDate = '';
    this.toDate = '';
    this.preset.set('all');
  }

  async exportExcel() {
    this.busy.set(true);
    await this.exportService.exportToExcel(
      this.filtered(),
      `wibotodo-${this.field()}-${Date.now()}`,
      this.range(),
    );
    this.busy.set(false);
  }

  exportPdf() {
    this.busy.set(true);
    this.exportService.exportToPdf(
      this.filtered(),
      `wibotodo-${this.field()}-${Date.now()}`,
      this.range(),
    );
    this.busy.set(false);
  }

  private startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private endOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }

  private toIso(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
