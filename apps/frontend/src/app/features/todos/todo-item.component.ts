import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { UploadService } from '../../core/services/upload.service';
import { Todo } from '../../core/models/todo.model';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, DatePipe, IconComponent],
  template: `
    <div
      class="group bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex gap-3"
      [class.border-slate-200/80]="!todo.isCompleted && !isOverdue()"
      [class.border-rose-200]="isOverdue()"
      [class.border-slate-200/60]="todo.isCompleted"
      [class.bg-slate-50/40]="todo.isCompleted"
    >
      <label class="flex items-start cursor-pointer pt-0.5">
        <input
          type="checkbox"
          [checked]="todo.isCompleted"
          (change)="toggle.emit(todo)"
          class="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
      </label>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h3
            class="font-medium break-words leading-snug"
            [class.text-slate-900]="!todo.isCompleted"
            [class.text-slate-500]="todo.isCompleted"
            [class.line-through]="todo.isCompleted"
          >
            {{ todo.title }}
          </h3>
          <button
            type="button"
            (click)="remove.emit(todo)"
            class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1 rounded-md hover:bg-rose-50"
            aria-label="Delete todo"
          >
            <app-icon name="x" [size]="14" />
          </button>
        </div>

        @if (todo.description) {
          <p
            class="text-sm mt-1 whitespace-pre-line leading-relaxed"
            [class.text-slate-600]="!todo.isCompleted"
            [class.text-slate-400]="todo.isCompleted"
          >
            {{ todo.description }}
          </p>
        }

        <div class="flex flex-wrap gap-1.5 mt-2.5 text-xs">
          @if (todo.dueDate) {
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border"
              [class.bg-rose-50]="isOverdue()"
              [class.text-rose-700]="isOverdue()"
              [class.border-rose-200]="isOverdue()"
              [class.bg-amber-50]="isDueToday() && !isOverdue()"
              [class.text-amber-700]="isDueToday() && !isOverdue()"
              [class.border-amber-200]="isDueToday() && !isOverdue()"
              [class.bg-slate-50]="!isOverdue() && !isDueToday()"
              [class.text-slate-600]="!isOverdue() && !isDueToday()"
              [class.border-slate-200]="!isOverdue() && !isDueToday()"
            >
              <app-icon name="calendar" [size]="11" />
              {{ todo.dueDate | date: 'EEE, d MMM HH:mm' }}
            </span>
          }
          @if (todo.isCompleted && todo.completedAt) {
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <app-icon name="check-circle" [size]="11" />
              {{ todo.completedAt | date: 'd MMM HH:mm' }}
            </span>
          }
        </div>

        @if (imageUrl()) {
          <img
            [src]="imageUrl()"
            alt="todo attachment"
            class="mt-3 max-h-48 rounded-lg border border-slate-200"
          />
        }
      </div>
    </div>
  `,
})
export class TodoItemComponent {
  private readonly uploadService = inject(UploadService);

  @Input({ required: true }) todo!: Todo;
  @Output() readonly toggle = new EventEmitter<Todo>();
  @Output() readonly remove = new EventEmitter<Todo>();

  imageUrl(): string | null {
    return this.uploadService.imageUrl(this.todo.imagePath);
  }

  isOverdue(): boolean {
    if (!this.todo.dueDate || this.todo.isCompleted) return false;
    return new Date(this.todo.dueDate).getTime() < Date.now();
  }

  isDueToday(): boolean {
    if (!this.todo.dueDate || this.todo.isCompleted) return false;
    const now = new Date();
    const due = new Date(this.todo.dueDate);
    return (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    );
  }
}
