import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateTodoPayload, Todo, TodoFilter, UpdateTodoPayload } from '../models/todo.model';
import { TodoStats } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/todos`;

  stats() {
    return this.http.get<TodoStats>(`${this.api}/stats`);
  }

  list(filter: TodoFilter = 'all', includeCompleted = false) {
    let params = new HttpParams().set('filter', filter);
    if (includeCompleted) params = params.set('includeCompleted', 'true');
    return this.http.get<Todo[]>(this.api, { params });
  }

  get(id: string) {
    return this.http.get<Todo>(`${this.api}/${id}`);
  }

  create(payload: CreateTodoPayload) {
    return this.http.post<Todo>(this.api, payload);
  }

  update(id: string, payload: UpdateTodoPayload) {
    return this.http.patch<Todo>(`${this.api}/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.api}/${id}`);
  }

  toggle(todo: Todo) {
    return this.update(todo.id, { isCompleted: !todo.isCompleted });
  }
}
