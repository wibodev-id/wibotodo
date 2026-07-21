import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import ExcelJS from 'exceljs';
import { IconComponent } from '../../../shared/icon.component';

@Component({
  selector: 'app-productivity-tools-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-4">
      <!-- Remove numbering tool -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center gap-2.5 mb-1">
          <span class="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <app-icon name="list" [size]="16" />
          </span>
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Remove numbering</h3>
            <p class="text-xs text-slate-500">
              Paste a numbered list — the "1.", "2)", "3 -" prefixes are stripped automatically.
              Copy or download as Excel to sort your data.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <!-- Input -->
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">
              Input (paste here)
            </label>
            <textarea
              [(ngModel)]="input"
              rows="12"
              placeholder="1. Arif Setyo&#10;2. Wibowo&#10;3. Jos"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl resize-y font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
            ></textarea>
            <p class="text-xs text-slate-400 mt-1">{{ inputLineCount() }} line(s)</p>
          </div>

          <!-- Output -->
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">
              Result (numbers removed)
            </label>
            <textarea
              [value]="output()"
              readonly
              rows="12"
              placeholder="Result appears here…"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl resize-y font-mono bg-slate-50 focus:outline-none"
            ></textarea>
            <p class="text-xs text-slate-400 mt-1">{{ lines().length }} row(s)</p>
          </div>
        </div>

        <!-- Options -->
        <div class="flex flex-wrap items-center gap-4 mt-3">
          <label class="inline-flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              [(ngModel)]="stripBullets"
              class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Also strip bullets (•, -, *)
          </label>
          <label class="inline-flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              [(ngModel)]="trimBlank"
              class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Remove blank lines
          </label>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-2 mt-4">
          <button
            type="button"
            (click)="copy()"
            [disabled]="lines().length === 0"
            class="px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <app-icon [name]="copied() ? 'check-circle' : 'copy'" [size]="14" />
            {{ copied() ? 'Copied!' : 'Copy result' }}
          </button>
          <button
            type="button"
            (click)="downloadExcel()"
            [disabled]="lines().length === 0"
            class="px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <app-icon name="sheet" [size]="14" />
            Download Excel
          </button>
          <button
            type="button"
            (click)="clear()"
            [disabled]="!input"
            class="px-3.5 py-2 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <app-icon name="trash" [size]="14" />
            Clear
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProductivityToolsTabComponent {
  private readonly inputSignal = signal('');
  private readonly stripBulletsSignal = signal(true);
  private readonly trimBlankSignal = signal(false);

  readonly copied = signal(false);

  // ngModel getters/setters proxy to signals so computed() reacts.
  get input() {
    return this.inputSignal();
  }
  set input(v: string) {
    this.inputSignal.set(v);
  }

  get stripBullets() {
    return this.stripBulletsSignal();
  }
  set stripBullets(v: boolean) {
    this.stripBulletsSignal.set(v);
  }

  get trimBlank() {
    return this.trimBlankSignal();
  }
  set trimBlank(v: boolean) {
    this.trimBlankSignal.set(v);
  }

  readonly lines = computed(() => {
    const raw = this.inputSignal().split(/\r?\n/);
    const cleaned = raw.map((line) => this.stripLeading(line, this.stripBulletsSignal()));
    return this.trimBlankSignal() ? cleaned.filter((l) => l.trim().length > 0) : cleaned;
  });

  readonly output = computed(() => this.lines().join('\n'));

  readonly inputLineCount = computed(() =>
    this.inputSignal() ? this.inputSignal().split(/\r?\n/).length : 0,
  );

  private stripLeading(line: string, bullets: boolean): string {
    // Remove leading whitespace + number + separator (. ) : - ) + spaces
    let result = line.replace(/^\s*\d+\s*[.)\]:\-]?\s*/, '');
    if (bullets) {
      result = result.replace(/^\s*[•\-*]\s+/, '');
    }
    return result;
  }

  copy() {
    navigator.clipboard.writeText(this.output()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    });
  }

  async downloadExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Data');
    sheet.columns = [{ header: 'Data', key: 'value', width: 40 }];
    sheet.getRow(1).font = { bold: true };
    this.lines().forEach((value) => sheet.addRow({ value }));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data-tanpa-nomor.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  clear() {
    this.inputSignal.set('');
  }
}
