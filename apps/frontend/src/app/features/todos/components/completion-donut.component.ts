import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-completion-donut',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-slate-900">Completion rate</h3>
          <p class="text-xs text-slate-500">Open vs completed (all time)</p>
        </div>
        <span class="text-2xl font-semibold text-slate-900 tabular-nums">{{ rate }}%</span>
      </div>
      <div class="relative h-48">
        <canvas #chart></canvas>
      </div>
      <div class="mt-4 flex justify-center gap-4 text-xs">
        <span class="flex items-center gap-1.5 text-slate-600">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Completed ({{ completed }})
        </span>
        <span class="flex items-center gap-1.5 text-slate-600">
          <span class="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
          Open ({{ open }})
        </span>
      </div>
    </div>
  `,
})
export class CompletionDonutComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chart') chartRef!: ElementRef<HTMLCanvasElement>;
  @Input() completed = 0;
  @Input() open = 0;
  @Input() rate = 0;

  private chart?: Chart;

  ngAfterViewInit() {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart && (changes['completed'] || changes['open'])) {
      this.chart.data.datasets[0].data = [this.completed, this.open];
      this.chart.update();
    }
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private render() {
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Open'],
        datasets: [
          {
            data: [this.completed, this.open],
            backgroundColor: ['#10b981', '#e2e8f0'],
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }
}
