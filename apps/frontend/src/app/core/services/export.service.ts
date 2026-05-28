import { Injectable } from '@angular/core';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Todo } from '../models/todo.model';

export type ExportDateField = 'createdAt' | 'dueDate' | 'completedAt';

export interface ExportRange {
  from: Date | null;
  to: Date | null;
  field: ExportDateField;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  filterByRange(todos: Todo[], range: ExportRange): Todo[] {
    const { from, to, field } = range;
    if (!from && !to) return todos;

    return todos.filter((t) => {
      const raw = t[field];
      if (!raw) return false;
      const date = new Date(raw).getTime();
      if (from && date < from.getTime()) return false;
      if (to && date > to.getTime()) return false;
      return true;
    });
  }

  async exportToExcel(todos: Todo[], filename = 'todos', range?: ExportRange) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'wibotodo';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Todos', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    sheet.columns = [
      { header: '#', key: 'idx', width: 6 },
      { header: 'Title', key: 'title', width: 36 },
      { header: 'Description', key: 'description', width: 42 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Due date', key: 'dueDate', width: 22 },
      { header: 'Completed at', key: 'completedAt', width: 22 },
      { header: 'Created at', key: 'createdAt', width: 22 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    sheet.getRow(1).alignment = { vertical: 'middle' };
    sheet.getRow(1).height = 22;

    if (range && (range.from || range.to)) {
      sheet.insertRow(1, [`Range: ${this.describeRange(range)}`]);
      sheet.mergeCells('A1:G1');
      const headerCell = sheet.getCell('A1');
      headerCell.font = { italic: true, color: { argb: 'FF64748B' } };
      headerCell.alignment = { vertical: 'middle' };
    }

    todos.forEach((todo, i) => {
      sheet.addRow({
        idx: i + 1,
        title: todo.title,
        description: todo.description ?? '',
        status: todo.isCompleted ? 'Completed' : 'Open',
        dueDate: todo.dueDate ? new Date(todo.dueDate) : '',
        completedAt: todo.completedAt ? new Date(todo.completedAt) : '',
        createdAt: new Date(todo.createdAt),
      });
    });

    const dateFormat = 'yyyy-mm-dd hh:mm';
    sheet.getColumn('dueDate').numFmt = dateFormat;
    sheet.getColumn('completedAt').numFmt = dateFormat;
    sheet.getColumn('createdAt').numFmt = dateFormat;

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const headerRow = range && (range.from || range.to) ? 2 : 1;
      if (rowNumber <= headerRow) return;
      const statusCell = row.getCell('status');
      const isCompleted = statusCell.value === 'Completed';
      statusCell.font = {
        color: { argb: isCompleted ? 'FF065F46' : 'FF7C2D12' },
        bold: true,
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    this.download(new Blob([buffer]), `${filename}.xlsx`);
  }

  exportToPdf(todos: Todo[], filename = 'todos', range?: ExportRange) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('wibotodo — todo list report', 40, 50);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const lines = [
      `Generated ${new Date().toLocaleString()}`,
      `${todos.length} item${todos.length === 1 ? '' : 's'}`,
    ];
    if (range && (range.from || range.to)) {
      lines.push(`Range: ${this.describeRange(range)}`);
    }
    doc.text(lines.join('  ·  '), 40, 68);

    autoTable(doc, {
      startY: 90,
      head: [['#', 'Title', 'Status', 'Due date', 'Completed at']],
      body: todos.map((t, i) => [
        i + 1,
        this.truncate(t.title, 50),
        t.isCompleted ? 'Completed' : 'Open',
        t.dueDate ? this.formatDate(t.dueDate) : '—',
        t.completedAt ? this.formatDate(t.completedAt) : '—',
      ]),
      styles: { fontSize: 9, cellPadding: 6, textColor: [30, 41, 59] },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontSize: 10,
        cellPadding: 8,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 70 },
        3: { cellWidth: 100 },
        4: { cellWidth: 100 },
      },
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth - 60,
          doc.internal.pageSize.getHeight() - 24,
        );
      },
    });

    doc.save(`${filename}.pdf`);
  }

  describeRange(range: ExportRange): string {
    const fieldLabel: Record<ExportDateField, string> = {
      createdAt: 'created',
      dueDate: 'due',
      completedAt: 'completed',
    };
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (range.from && range.to) {
      return `${fieldLabel[range.field]} ${fmt(range.from)} – ${fmt(range.to)}`;
    }
    if (range.from) return `${fieldLabel[range.field]} from ${fmt(range.from)}`;
    if (range.to) return `${fieldLabel[range.field]} until ${fmt(range.to)}`;
    return 'all time';
  }

  private formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private truncate(text: string, max: number): string {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  }

  private download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
