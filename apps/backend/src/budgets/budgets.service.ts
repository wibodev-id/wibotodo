import { BadRequestException, Injectable } from '@nestjs/common';
import { BudgetSection } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SaveBudgetDto } from './dto/save-budget.dto';

const SECTION: Record<string, BudgetSection> = {
  income: BudgetSection.INCOME, expenses: BudgetSection.EXPENSES,
  meals: BudgetSection.MEALS, homecoming: BudgetSection.HOMECOMING,
  pending: BudgetSection.PENDING,
};

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  private validateMonth(month: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new BadRequestException('Month must use YYYY-MM');
  }

  async find(userId: string, month: string) {
    this.validateMonth(month);
    const budget = await this.prisma.monthlyBudget.findUnique({
      where: { userId_month: { userId, month } },
      include: { items: { orderBy: [{ section: 'asc' }, { position: 'asc' }] } },
    });
    if (!budget) return { month, items: [] };
    return { month, items: budget.items.map(i => ({
      id: i.id, section: i.section.toLowerCase(), name: i.name,
      budget: i.budget, actual: i.actual, amount: i.amount, done: i.done, position: i.position,
    })) };
  }

  async save(userId: string, month: string, dto: SaveBudgetDto) {
    this.validateMonth(month);
    await this.prisma.$transaction(async tx => {
      const budget = await tx.monthlyBudget.upsert({
        where: { userId_month: { userId, month } }, update: {}, create: { userId, month },
      });
      await tx.budgetItem.deleteMany({ where: { monthlyBudgetId: budget.id } });
      if (dto.items.length) await tx.budgetItem.createMany({ data: dto.items.map(i => ({
        id: i.id, monthlyBudgetId: budget.id, section: SECTION[i.section], name: i.name,
        budget: i.budget, actual: i.actual, amount: i.amount, done: i.done, position: i.position,
      })) });
    });
    return this.find(userId, month);
  }
}
