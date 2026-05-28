import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent, IconName } from '../../../shared/icon.component';

export type StatTone = 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';

const TONE_CLASSES: Record<StatTone, { bg: string; text: string; ring: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-100' },
};

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      class="group relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">{{ label }}</p>
          <p class="mt-2 text-3xl font-semibold text-slate-900 tabular-nums">{{ value }}</p>
          @if (hint) {
            <p class="mt-1 text-xs text-slate-500">{{ hint }}</p>
          }
        </div>
        <div
          class="p-2.5 rounded-xl ring-1"
          [ngClass]="[toneClasses.bg, toneClasses.text, toneClasses.ring]"
        >
          <app-icon [name]="icon" [size]="20" />
        </div>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value: number | string = 0;
  @Input() hint?: string;
  @Input({ required: true }) icon!: IconName;
  @Input() tone: StatTone = 'indigo';

  get toneClasses() {
    return TONE_CLASSES[this.tone];
  }
}
