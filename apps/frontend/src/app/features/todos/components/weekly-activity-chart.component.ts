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
import { WeeklyActivityPoint } from '../../../core/models/stats.model';

Chart.register(...registerables);

@Component({
  selector: 'app-weekly-activity-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-slate-900">Weekly activity</h3>
          <p class="text-xs text-slate-500">Created vs completed (last 7 days)</p>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <span class="flex items-center gap-1.5 text-slate-600">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            Created
          </span>
          <span class="flex items-center gap-1.5 text-slate-600">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        </div>
      </div>
      <div class="relative h-48">
        <canvas #chart></canvas>
      </div>
    </div>
  `,
})
export class WeeklyActivityChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chart') chartRef!: ElementRef<HTMLCanvasElement>;
  @Input() data: WeeklyActivityPoint[] = [];

  private chart?: Chart;

  ngAfterViewInit() {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart && changes['data']) {
      this.update();
    }
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private render() {
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: this.chartData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 1, precision: 0 },
            grid: { color: '#f1f5f9' },
            border: { display: false },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private update() {
    if (!this.chart) return;
    const next = this.chartData();
    this.chart.data.labels = next.labels;
    this.chart.data.datasets = next.datasets;
    this.chart.update();
  }

  private chartData() {
    const labels = this.data.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Created',
          data: this.data.map((d) => d.created),
          backgroundColor: '#6366f1',
          borderRadius: 6,
          maxBarThickness: 24,
        },
        {
          label: 'Completed',
          data: this.data.map((d) => d.completed),
          backgroundColor: '#10b981',
          borderRadius: 6,
          maxBarThickness: 24,
        },
      ],
    };
  }
}
