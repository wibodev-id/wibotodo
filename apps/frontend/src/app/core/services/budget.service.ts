import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface BudgetWireItem {
  id: string; section: string; name: string; budget: number; actual: number;
  amount: number; done: boolean; position: number;
}
export interface BudgetResponse { month: string; items: BudgetWireItem[]; }

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/budgets`;
  get(month: string) { return this.http.get<BudgetResponse>(`${this.api}/${month}`); }
  save(month: string, items: BudgetWireItem[]) {
    return this.http.put<BudgetResponse>(`${this.api}/${month}`, { items });
  }
}
