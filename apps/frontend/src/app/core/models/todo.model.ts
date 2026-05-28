export interface Todo {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  imagePath: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type TodoFilter = 'all' | 'today' | 'week' | 'overdue' | 'completed';

export interface CreateTodoPayload {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  imagePath?: string | null;
  isCompleted?: boolean;
}

export type UpdateTodoPayload = Partial<CreateTodoPayload>;
