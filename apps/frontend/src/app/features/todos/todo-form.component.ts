import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TodoService } from '../../core/services/todo.service';
import { UploadService } from '../../core/services/upload.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="submit()"
      class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3"
    >
      <div class="flex items-center gap-2 text-slate-900 mb-1">
        <app-icon name="plus" [size]="16" />
        <h3 class="text-sm font-semibold">Add a new todo</h3>
      </div>

      <input
        type="text"
        formControlName="title"
        placeholder="What needs to be done?"
        class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      />
      <textarea
        formControlName="description"
        rows="2"
        placeholder="Add notes (optional)"
        class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
      ></textarea>

      <div class="flex flex-wrap items-end gap-3">
        <label class="text-xs font-medium text-slate-600">
          <span class="block mb-1.5 flex items-center gap-1.5">
            <app-icon name="calendar" [size]="13" /> Due date
          </span>
          <input
            type="datetime-local"
            formControlName="dueDate"
            class="px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </label>

        <label
          class="text-xs font-medium text-slate-600 cursor-pointer flex flex-col items-start"
        >
          <span class="block mb-1.5 flex items-center gap-1.5">
            <app-icon name="image" [size]="13" /> Image (optional)
          </span>
          <span
            class="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
          >
            <app-icon name="image" [size]="14" />
            <span>{{ uploadedPath() ? 'Replace image' : 'Choose file' }}</span>
          </span>
          <input
            type="file"
            accept="image/*"
            (change)="onFile($event)"
            class="hidden"
          />
        </label>

        @if (uploading()) {
          <span class="text-xs text-slate-500 self-end pb-2.5">Uploading…</span>
        }
        @if (uploadedPath()) {
          <span
            class="self-end mb-1 inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1"
          >
            <app-icon name="check-circle" [size]="12" /> image attached
          </span>
        }

        <div class="flex-1"></div>

        <button
          type="submit"
          [disabled]="form.invalid || loading()"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm inline-flex items-center gap-2"
        >
          <app-icon name="plus" [size]="14" />
          {{ loading() ? 'Saving…' : 'Add todo' }}
        </button>
      </div>

      @if (error()) {
        <div
          class="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 flex items-start gap-2"
        >
          <app-icon name="alert-triangle" [size]="14" />
          <span>{{ error() }}</span>
        </div>
      }
    </form>
  `,
})
export class TodoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly todoService = inject(TodoService);
  private readonly uploadService = inject(UploadService);

  @Output() readonly created = new EventEmitter<void>();

  readonly loading = signal(false);
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);
  readonly uploadedPath = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    dueDate: [''],
  });

  onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.error.set(null);
    this.uploading.set(true);
    this.uploadService.upload(file).subscribe({
      next: (res) => {
        this.uploadedPath.set(res.path);
        this.uploading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.uploading.set(false);
        this.error.set(err.error?.message ?? 'Upload failed');
        input.value = '';
      },
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    this.todoService
      .create({
        title: raw.title,
        description: raw.description || null,
        dueDate: raw.dueDate ? new Date(raw.dueDate).toISOString() : null,
        imagePath: this.uploadedPath(),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.form.reset();
          this.uploadedPath.set(null);
          this.created.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'Could not create todo');
        },
      });
  }
}
