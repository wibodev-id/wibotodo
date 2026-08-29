import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/icon.component';

type MoneyItem = { id: string; name: string; budget: number; actual: number };
type SimpleItem = { id: string; name: string; amount: number };
type BudgetData = {
  income: SimpleItem[];
  expenses: MoneyItem[];
  meals: SimpleItem[];
  homecoming: SimpleItem[];
  pending: SimpleItem[];
};

const emptyData = (): BudgetData => ({
  income: [], expenses: [], meals: [], homecoming: [], pending: [],
});

@Component({
  selector: 'app-monthly-budget-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-5">
      <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-end justify-between gap-4">
        <div>
          <label class="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1.5">Periode anggaran</label>
          <input type="month" [ngModel]="month()" (ngModelChange)="changeMonth($event)"
            class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <p class="text-xs text-slate-500">Tersimpan otomatis di perangkat ini</p>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        @for (card of summaryCards(); track card.label) {
          <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ card.label }}</p>
            <p class="mt-1 text-xl font-semibold tabular-nums" [class]="card.tone">{{ rupiah(card.value) }}</p>
            <p class="mt-0.5 text-xs text-slate-400">{{ card.hint }}</p>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section class="xl:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-200 flex justify-between items-center">
            <div><h3 class="font-semibold text-slate-900">Pemasukan</h3><p class="text-xs text-slate-500">Dana masuk bulan ini</p></div>
            <button (click)="addSimple('income')" class="btn-add"><app-icon name="plus" [size]="12" /> Tambah</button>
          </div>
          <div class="p-4 space-y-2">
            @for (item of data().income; track item.id) {
              <div draggable="true" (dragstart)="startDrag('income', item.id)" (dragover)="$event.preventDefault()" (drop)="dropOn('income', item.id)" class="grid grid-cols-[22px_1fr_120px_30px] gap-2 items-center drag-row">
                <span class="drag-handle" title="Geser untuk mengubah urutan"><app-icon name="grip" [size]="16" /></span>
                <input [(ngModel)]="item.name" (ngModelChange)="save()" placeholder="Contoh: Gaji" class="field" />
                <input type="text" inputmode="numeric" [value]="formatNumber(item.amount)" (input)="setSimpleAmount(item, $event)" placeholder="0" class="field text-right" />
                <button (click)="removeSimple('income', item.id)" class="btn-trash"><app-icon name="trash" [size]="13" /></button>
              </div>
            } @empty { <p class="empty">Belum ada pemasukan.</p> }
          </div>
        </section>

        <section class="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-200 flex justify-between items-center">
            <div><h3 class="font-semibold text-slate-900">Pengeluaran</h3><p class="text-xs text-slate-500">Bandingkan rencana dengan realisasi</p></div>
            <button (click)="addExpense()" class="btn-add"><app-icon name="plus" [size]="12" /> Tambah</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="text-left text-xs uppercase tracking-wide text-slate-500 bg-slate-50"><th class="px-4 py-2.5">Keperluan</th><th class="px-2 py-2.5 text-right">Budget</th><th class="px-2 py-2.5 text-right">Realisasi</th><th class="px-2 py-2.5 text-right">Sisa</th><th></th></tr></thead>
              <tbody class="divide-y divide-slate-100">
                @for (item of data().expenses; track item.id) {
                  <tr draggable="true" (dragstart)="startDrag('expenses', item.id)" (dragover)="$event.preventDefault()" (drop)="dropOn('expenses', item.id)" class="drag-row">
                    <td class="px-2 py-2"><div class="flex items-center gap-1"><span class="drag-handle" title="Geser untuk mengubah urutan"><app-icon name="grip" [size]="16" /></span><input [(ngModel)]="item.name" (ngModelChange)="save()" placeholder="Nama pengeluaran" class="field" /></div></td>
                    <td class="px-2 py-2"><input type="text" inputmode="numeric" [value]="formatNumber(item.budget)" (input)="setExpenseAmount(item, 'budget', $event)" class="field text-right" /></td>
                    <td class="px-2 py-2"><input type="text" inputmode="numeric" [value]="formatNumber(item.actual)" (input)="setExpenseAmount(item, 'actual', $event)" class="field text-right" /></td>
                    <td class="px-2 py-2 text-right font-medium tabular-nums" [class.text-rose-600]="item.actual > item.budget">{{ rupiah(item.budget - item.actual) }}</td>
                    <td class="pr-3"><button (click)="removeExpense(item.id)" class="btn-trash"><app-icon name="trash" [size]="13" /></button></td>
                  </tr>
                } @empty { <tr><td colspan="5" class="empty">Belum ada pengeluaran.</td></tr> }
              </tbody>
              <tfoot><tr class="font-semibold bg-slate-50 border-t border-slate-200"><td class="px-4 py-3">Total</td><td class="px-2 py-3 text-right">{{ rupiah(expenseBudget()) }}</td><td class="px-2 py-3 text-right">{{ rupiah(expenseActual()) }}</td><td class="px-2 py-3 text-right">{{ rupiah(expenseRemaining()) }}</td><td></td></tr></tfoot>
            </table>
          </div>
        </section>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        @for (section of detailSections; track section.key) {
          <section class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="p-4 border-b border-slate-200 flex justify-between items-center">
              <div><h3 class="font-semibold text-slate-900">{{ section.title }}</h3><p class="text-xs text-slate-500">{{ section.subtitle }}</p></div>
              <button (click)="addSimple(section.key)" class="btn-add"><app-icon name="plus" [size]="12" /></button>
            </div>
            <div class="p-4 space-y-2">
              @for (item of simpleItems(section.key); track item.id) {
                <div draggable="true" (dragstart)="startDrag(section.key, item.id)" (dragover)="$event.preventDefault()" (drop)="dropOn(section.key, item.id)" class="grid grid-cols-[22px_1fr_105px_30px] gap-2 items-center drag-row">
                  <span class="drag-handle" title="Geser untuk mengubah urutan"><app-icon name="grip" [size]="16" /></span>
                  <input [(ngModel)]="item.name" (ngModelChange)="save()" placeholder="Keperluan" class="field" />
                  <input type="text" inputmode="numeric" [value]="formatNumber(item.amount)" (input)="setSimpleAmount(item, $event)" class="field text-right" />
                  <button (click)="removeSimple(section.key, item.id)" class="btn-trash"><app-icon name="trash" [size]="13" /></button>
                </div>
              } @empty { <p class="empty">Belum ada data.</p> }
            </div>
            <div class="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-between text-sm font-semibold"><span>Total</span><span>{{ rupiah(simpleTotal(section.key)) }}</span></div>
          </section>
        }
      </div>
    </div>
  `,
  styles: [`
    .field { width:100%; min-width:0; border:1px solid rgb(226 232 240); border-radius:.5rem; padding:.45rem .6rem; font-size:.875rem; outline:none; }
    .field:focus { border-color:rgb(129 140 248); box-shadow:0 0 0 2px rgb(99 102 241 / .15); }
    .btn-add { display:inline-flex; align-items:center; gap:.3rem; padding:.45rem .65rem; border-radius:.5rem; background:rgb(238 242 255); color:rgb(67 56 202); font-size:.75rem; font-weight:600; }
    .btn-add:hover { background:rgb(224 231 255); }
    .btn-trash { width:30px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:.5rem; color:rgb(148 163 184); }
    .btn-trash:hover { color:rgb(225 29 72); background:rgb(255 241 242); }
    .drag-row { transition: background-color .15s, opacity .15s; }
    .drag-row:hover { background-color:rgb(248 250 252); }
    .drag-handle { cursor:grab; color:rgb(148 163 184); display:flex; align-items:center; justify-content:center; touch-action:none; }
    .drag-handle:active { cursor:grabbing; }
    .empty { padding:1.5rem .5rem; text-align:center; color:rgb(148 163 184); font-size:.75rem; }
  `],
})
export class MonthlyBudgetTabComponent {
  @Input({ required: true }) userId = 'guest';
  readonly month = signal(new Date().toISOString().slice(0, 7));
  readonly data = signal<BudgetData>(emptyData());
  private dragged: { section: keyof BudgetData; id: string } | null = null;

  readonly detailSections: { key: 'meals' | 'homecoming' | 'pending'; title: string; subtitle: string }[] = [
    { key: 'meals', title: 'Makan mingguan', subtitle: 'Rincian belanja makan' },
    { key: 'homecoming', title: 'Pulkam mingguan', subtitle: 'Rincian perjalanan pulang' },
    { key: 'pending', title: 'Pending', subtitle: 'Kebutuhan yang belum dibayar' },
  ];

  readonly incomeTotal = computed(() => this.data().income.reduce((n, i) => n + (+i.amount || 0), 0));
  readonly expenseBudget = computed(() => this.data().expenses.reduce((n, i) => n + (+i.budget || 0), 0));
  readonly expenseActual = computed(() => this.data().expenses.reduce((n, i) => n + (+i.actual || 0), 0));
  readonly expenseRemaining = computed(() => this.expenseBudget() - this.expenseActual());
  readonly allocatedRemaining = computed(() => this.incomeTotal() - this.expenseBudget());
  readonly cashRemaining = computed(() => this.incomeTotal() - this.expenseActual());
  readonly summaryCards = computed(() => [
    { label: 'Pemasukan', value: this.incomeTotal(), hint: 'total dana masuk', tone: 'text-slate-900' },
    { label: 'Budget', value: this.expenseBudget(), hint: 'rencana pengeluaran', tone: 'text-indigo-600' },
    { label: 'Realisasi', value: this.expenseActual(), hint: 'sudah dikeluarkan', tone: 'text-amber-600' },
    { label: 'Sisa dana', value: this.cashRemaining(), hint: `belum dialokasikan ${this.rupiah(this.allocatedRemaining())}`, tone: this.cashRemaining() < 0 ? 'text-rose-600' : 'text-emerald-600' },
  ]);

  ngOnInit() { this.load(); }
  private storageKey() { return `wibotodo.budget.${this.userId}.${this.month()}`; }
  changeMonth(value: string) { this.month.set(value); this.load(); }
  private load() {
    try { this.data.set(JSON.parse(localStorage.getItem(this.storageKey()) || '') as BudgetData); }
    catch { this.data.set(emptyData()); }
  }
  save() { localStorage.setItem(this.storageKey(), JSON.stringify(this.data())); this.data.set({ ...this.data() }); }
  private id() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
  addExpense() { this.data().expenses.push({ id: this.id(), name: '', budget: 0, actual: 0 }); this.save(); }
  removeExpense(id: string) { this.data().expenses = this.data().expenses.filter(i => i.id !== id); this.save(); }
  simpleItems(key: 'income' | 'meals' | 'homecoming' | 'pending') { return this.data()[key]; }
  addSimple(key: 'income' | 'meals' | 'homecoming' | 'pending') { this.data()[key].push({ id: this.id(), name: '', amount: 0 }); this.save(); }
  removeSimple(key: 'income' | 'meals' | 'homecoming' | 'pending', id: string) { this.data()[key] = this.data()[key].filter(i => i.id !== id); this.save(); }
  simpleTotal(key: 'meals' | 'homecoming' | 'pending') { return this.data()[key].reduce((n, i) => n + (+i.amount || 0), 0); }
  formatNumber(value: number) { return value ? new Intl.NumberFormat('id-ID').format(value) : ''; }
  private numberFrom(event: Event) { return Number((event.target as HTMLInputElement).value.replace(/\D/g, '')) || 0; }
  setSimpleAmount(item: SimpleItem, event: Event) {
    item.amount = this.numberFrom(event);
    (event.target as HTMLInputElement).value = this.formatNumber(item.amount);
    this.save();
  }
  setExpenseAmount(item: MoneyItem, field: 'budget' | 'actual', event: Event) {
    item[field] = this.numberFrom(event);
    (event.target as HTMLInputElement).value = this.formatNumber(item[field]);
    this.save();
  }
  startDrag(section: keyof BudgetData, id: string) { this.dragged = { section, id }; }
  dropOn(section: keyof BudgetData, targetId: string) {
    if (!this.dragged || this.dragged.section !== section || this.dragged.id === targetId) return;
    const items = this.data()[section] as Array<MoneyItem | SimpleItem>;
    const from = items.findIndex(item => item.id === this.dragged!.id);
    const to = items.findIndex(item => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    this.dragged = null;
    this.save();
  }
  rupiah(value: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0); }
}
