import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Todo, TodoFilter } from '../../core/models/todo.model';
import { TodoStats } from '../../core/models/stats.model';
import { TodoService } from '../../core/services/todo.service';
import { IconComponent, IconName } from '../../shared/icon.component';
import { CompletionDonutComponent } from './components/completion-donut.component';
import { ReportsTabComponent } from './components/reports-tab.component';
import { StatCardComponent } from './components/stat-card.component';
import { WeeklyActivityChartComponent } from './components/weekly-activity-chart.component';
import { TodoFormComponent } from './todo-form.component';
import { TodoItemComponent } from './todo-item.component';

type Tab = 'dashboard' | 'todos' | 'reports';

interface TabDef {
  value: Tab;
  label: string;
  icon: IconName;
  description: string;
}

interface FilterOption {
  value: TodoFilter;
  label: string;
  icon: IconName;
  count: (s: TodoStats | null) => number | null;
}

@Component({
  selector: 'app-todos-page',
  standalone: true,
  imports: [
    CommonModule,
    TodoFormComponent,
    TodoItemComponent,
    StatCardComponent,
    CompletionDonutComponent,
    WeeklyActivityChartComponent,
    ReportsTabComponent,
    IconComponent,
    RouterLink,
  ],
  template: `
    <div class="min-h-screen bg-slate-50">
      <header
        class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span
              class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md"
            >
              <app-icon name="check-circle" [size]="18" />
            </span>
            <div>
              <h1 class="text-base font-semibold text-slate-900 leading-tight">wibotodo</h1>
              <p class="text-xs text-slate-500 leading-tight">
                {{ auth.user()?.name || auth.user()?.email }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              (click)="refresh()"
              [disabled]="loading()"
              class="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition inline-flex items-center gap-1.5"
              title="Refresh"
            >
              <app-icon name="refresh" [size]="14" />
            </button>

            <button
              type="button"
              (click)="logout()"
              class="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition inline-flex items-center gap-1.5"
            >
              <app-icon name="log-out" [size]="14" />
              <span class="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        <!-- Tab nav -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="flex gap-1 -mb-px">
            @for (t of tabs; track t.value) {
              <button
                type="button"
                (click)="setTab(t.value)"
                class="px-4 py-2.5 text-sm font-medium border-b-2 transition inline-flex items-center gap-2"
                [class.border-indigo-600]="tab() === t.value"
                [class.text-indigo-700]="tab() === t.value"
                [class.border-transparent]="tab() !== t.value"
                [class.text-slate-500]="tab() !== t.value"
                [class.hover:text-slate-700]="tab() !== t.value"
                [class.hover:border-slate-300]="tab() !== t.value"
              >
                <app-icon [name]="t.icon" [size]="14" />
                {{ t.label }}
              </button>
            }
          </nav>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <!-- ════════════════════════ DASHBOARD TAB ════════════════════════ -->
        @if (tab() === 'dashboard') {
          <div class="flex items-baseline gap-3">
            <h2 class="text-2xl font-semibold text-slate-900">
              {{ greeting() }}, {{ firstName() }}.
            </h2>
            <p class="text-sm text-slate-500 hidden sm:block">
              {{ stats()?.openCount ?? 0 }} open · {{ stats()?.completedCount ?? 0 }} completed
            </p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <app-stat-card
              label="Open"
              [value]="stats()?.openCount ?? 0"
              [hint]="
                stats()?.dueTodayCount
                  ? stats()!.dueTodayCount + ' due today'
                  : 'nothing due today'
              "
              icon="list"
              tone="indigo"
            />
            <app-stat-card
              label="Completed today"
              [value]="stats()?.completedTodayCount ?? 0"
              hint="great rhythm today"
              icon="check-circle"
              tone="emerald"
            />
            <app-stat-card
              label="Overdue"
              [value]="stats()?.overdueCount ?? 0"
              [hint]="
                (stats()?.overdueCount ?? 0) > 0 ? 'needs attention' : 'all caught up'
              "
              icon="alert-triangle"
              [tone]="(stats()?.overdueCount ?? 0) > 0 ? 'rose' : 'slate'"
            />
            <app-stat-card
              label="Completion rate"
              [value]="(stats()?.completionRate ?? 0) + '%'"
              [hint]="stats()?.totalCount + ' total · all time'"
              icon="trend-up"
              tone="amber"
            />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="lg:col-span-2">
              <app-weekly-activity-chart [data]="stats()?.weeklyActivity ?? []" />
            </div>
            <div class="lg:col-span-1">
              <app-completion-donut
                [completed]="stats()?.completedCount ?? 0"
                [open]="stats()?.openCount ?? 0"
                [rate]="stats()?.completionRate ?? 0"
              />
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5"
          >
            <div class="flex items-center gap-3">
              <span class="p-2 bg-white rounded-xl text-indigo-600 shadow-sm">
                <app-icon name="sparkles" [size]="18" />
              </span>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-900">
                  Manage todos in the
                  <button (click)="setTab('todos')" class="underline hover:text-indigo-700">
                    Todos
                  </button>
                  tab.
                </p>
                <p class="text-xs text-slate-600 mt-0.5">
                  Or generate a filtered PDF/Excel in
                  <button (click)="setTab('reports')" class="underline hover:text-indigo-700">
                    Reports
                  </button>
                  .
                </p>
              </div>
            </div>
          </div>
        }

        <!-- ════════════════════════ TODOS TAB ════════════════════════ -->
        @if (tab() === 'todos') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1 space-y-4">
              <app-todo-form (created)="onCreated()" />

              <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <div class="flex items-center gap-2 text-slate-900 mb-3">
                  <app-icon name="filter" [size]="14" />
                  <h3 class="text-sm font-semibold">Filter</h3>
                </div>
                <div class="space-y-1">
                  @for (f of filters; track f.value) {
                    <button
                      type="button"
                      (click)="setFilter(f.value)"
                      class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition"
                      [class.bg-indigo-50]="filter() === f.value"
                      [class.text-indigo-700]="filter() === f.value"
                      [class.font-medium]="filter() === f.value"
                      [class.text-slate-700]="filter() !== f.value"
                      [class.hover:bg-slate-50]="filter() !== f.value"
                    >
                      <span class="flex items-center gap-2.5">
                        <app-icon [name]="f.icon" [size]="14" />
                        {{ f.label }}
                      </span>
                      @if (f.count(stats()) !== null) {
                        <span
                          class="text-xs px-1.5 py-0.5 rounded-md"
                          [class.bg-white]="filter() === f.value"
                          [class.text-indigo-700]="filter() === f.value"
                          [class.bg-slate-100]="filter() !== f.value"
                          [class.text-slate-600]="filter() !== f.value"
                        >
                          {{ f.count(stats()) }}
                        </span>
                      }
                    </button>
                  }
                </div>
              </div>
            </div>

            <div class="lg:col-span-2 space-y-3">
              <div class="flex items-baseline justify-between">
                <h3 class="text-sm font-semibold text-slate-900">
                  {{ activeFilterLabel() }}
                </h3>
                <p class="text-xs text-slate-500">
                  {{ todos().length }} item{{ todos().length === 1 ? '' : 's' }}
                </p>
              </div>

              @if (loading()) {
                <div class="space-y-3">
                  @for (i of [1, 2, 3]; track i) {
                    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 animate-pulse">
                      <div class="flex gap-3">
                        <div class="w-5 h-5 bg-slate-200 rounded-md"></div>
                        <div class="flex-1 space-y-2">
                          <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else if (todos().length === 0) {
                <div
                  class="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl"
                >
                  <div class="inline-flex p-3 bg-slate-100 rounded-2xl text-slate-400 mb-3">
                    <app-icon name="check-circle" [size]="24" />
                  </div>
                  <p class="text-sm font-medium text-slate-700">No todos in this view</p>
                  <p class="text-xs text-slate-500 mt-1">
                    Add one using the form on the left to get started.
                  </p>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (todo of todos(); track todo.id) {
                    <app-todo-item
                      [todo]="todo"
                      (toggle)="onToggle($event)"
                      (remove)="onRemove($event)"
                    />
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- ════════════════════════ REPORTS TAB ════════════════════════ -->
        @if (tab() === 'reports') {
          <div class="flex items-baseline gap-3">
            <h2 class="text-2xl font-semibold text-slate-900">Reports</h2>
            <p class="text-sm text-slate-500 hidden sm:block">
              Filter by date and export as PDF or Excel
            </p>
          </div>
          <app-reports-tab [todos]="allTodos()" />
        }
      </main>

      <footer class="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-slate-400">
        <p class="mb-2">
          wibotodo · made by
          <a
            href="https://wibosystems.com"
            target="_blank"
            rel="noopener"
            class="text-slate-500 hover:text-indigo-600 underline-offset-2 hover:underline"
          >
            Wibo Systems
          </a>
        </p>
        <div class="flex items-center justify-center gap-4">
          <a routerLink="/terms" class="hover:text-slate-600 transition">Terms of Service</a>
          <span aria-hidden="true">·</span>
          <a routerLink="/privacy" class="hover:text-slate-600 transition">Privacy Policy</a>
        </div>
      </footer>
    </div>
  `,
})
export class TodosPageComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly todoService = inject(TodoService);
  private readonly router = inject(Router);

  readonly tabs: TabDef[] = [
    {
      value: 'dashboard',
      label: 'Dashboard',
      icon: 'trend-up',
      description: 'KPIs and weekly activity',
    },
    { value: 'todos', label: 'Todos', icon: 'list', description: 'Manage your todo list' },
    { value: 'reports', label: 'Reports', icon: 'download', description: 'Export PDF & Excel' },
  ];

  readonly filters: FilterOption[] = [
    { value: 'all', label: 'All open', icon: 'list', count: (s) => s?.openCount ?? null },
    { value: 'today', label: 'Today', icon: 'clock', count: (s) => s?.dueTodayCount ?? null },
    { value: 'week', label: 'This week', icon: 'calendar', count: () => null },
    {
      value: 'overdue',
      label: 'Overdue',
      icon: 'alert-triangle',
      count: (s) => s?.overdueCount ?? null,
    },
    {
      value: 'completed',
      label: 'Completed',
      icon: 'check-circle',
      count: (s) => s?.completedCount ?? null,
    },
  ];

  readonly tab = signal<Tab>('dashboard');
  readonly filter = signal<TodoFilter>('all');
  readonly todos = signal<Todo[]>([]);
  readonly allTodos = signal<Todo[]>([]);
  readonly stats = signal<TodoStats | null>(null);
  readonly loading = signal(false);

  readonly activeFilterLabel = computed(
    () => this.filters.find((f) => f.value === this.filter())?.label ?? 'Todos',
  );

  readonly firstName = computed(() => {
    const user = this.auth.user();
    if (user?.name) return user.name.split(' ')[0];
    return user?.email.split('@')[0] ?? 'there';
  });

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  ngOnInit() {
    this.refresh();
  }

  setTab(value: Tab) {
    this.tab.set(value);
  }

  setFilter(value: TodoFilter) {
    if (this.filter() === value) return;
    this.filter.set(value);
    this.loadTodos();
  }

  refresh() {
    this.loading.set(true);
    forkJoin({
      todos: this.todoService.list(this.filter()),
      allTodos: this.todoService.list('all', true),
      stats: this.todoService.stats(),
    }).subscribe({
      next: ({ todos, allTodos, stats }) => {
        this.todos.set(todos);
        this.allTodos.set(allTodos);
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadTodos() {
    this.loading.set(true);
    this.todoService.list(this.filter()).subscribe({
      next: (items) => {
        this.todos.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onCreated() {
    this.refresh();
  }

  onToggle(todo: Todo) {
    this.todoService.toggle(todo).subscribe({
      next: () => this.refresh(),
    });
  }

  onRemove(todo: Todo) {
    if (!confirm(`Delete "${todo.title}"?`)) return;
    this.todoService.remove(todo.id).subscribe({
      next: () => this.refresh(),
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
