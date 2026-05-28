import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';

export type IconName =
  | 'check-circle'
  | 'circle'
  | 'clock'
  | 'alert-triangle'
  | 'calendar'
  | 'trend-up'
  | 'plus'
  | 'x'
  | 'log-out'
  | 'image'
  | 'download'
  | 'file-text'
  | 'sheet'
  | 'play'
  | 'sparkles'
  | 'list'
  | 'filter'
  | 'refresh';

/**
 * Maps our semantic icon names to Bootstrap Icons class names.
 * Full list: https://icons.getbootstrap.com
 */
const ICON_CLASS: Record<IconName, string> = {
  'check-circle': 'bi-check-circle-fill',
  circle: 'bi-circle',
  clock: 'bi-clock',
  'alert-triangle': 'bi-exclamation-triangle-fill',
  calendar: 'bi-calendar-event',
  'trend-up': 'bi-graph-up-arrow',
  plus: 'bi-plus-lg',
  x: 'bi-x-lg',
  'log-out': 'bi-box-arrow-right',
  image: 'bi-image',
  download: 'bi-download',
  'file-text': 'bi-file-earmark-pdf',
  sheet: 'bi-file-earmark-spreadsheet',
  play: 'bi-play-fill',
  sparkles: 'bi-stars',
  list: 'bi-list-ul',
  filter: 'bi-funnel',
  refresh: 'bi-arrow-clockwise',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `<i [class]="cssClass()" [style.fontSize.px]="size" [style.lineHeight]="'1'"></i>`,
  host: { class: 'inline-flex items-center justify-center' },
})
export class IconComponent {
  @Input({ required: true }) set name(value: IconName) {
    this.nameSignal.set(value);
  }
  @Input() size = 16;

  private readonly nameSignal = signal<IconName>('circle');
  protected readonly cssClass = computed(() => `bi ${ICON_CLASS[this.nameSignal()]}`);
}
