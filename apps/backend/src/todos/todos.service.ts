import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodosDto, TodoFilter } from './dto/query-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        dueDate: dto.dueDate ?? null,
        imagePath: dto.imagePath ?? null,
        isCompleted: dto.isCompleted ?? false,
        completedAt: dto.isCompleted ? new Date() : null,
        userId,
      },
    });
  }

  findAll(userId: string, query: QueryTodosDto) {
    const where: Prisma.TodoWhereInput = { userId };
    const filter = query.filter ?? TodoFilter.ALL;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case TodoFilter.TODAY:
        where.dueDate = { gte: startOfToday, lt: endOfToday };
        where.isCompleted = false;
        break;
      case TodoFilter.WEEK:
        where.dueDate = { gte: startOfToday, lt: endOfWeek };
        where.isCompleted = false;
        break;
      case TodoFilter.OVERDUE:
        where.dueDate = { lt: startOfToday };
        where.isCompleted = false;
        break;
      case TodoFilter.COMPLETED:
        where.isCompleted = true;
        break;
      case TodoFilter.ALL:
      default:
        if (!query.includeCompleted) {
          where.isCompleted = false;
        }
        break;
    }

    return this.prisma.todo.findMany({
      where,
      orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new NotFoundException('Todo not found');
    if (todo.userId !== userId) throw new ForbiddenException();
    return todo;
  }

  async update(userId: string, id: string, dto: UpdateTodoDto) {
    const existing = await this.findOne(userId, id);

    const data: Prisma.TodoUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate;
    if (dto.imagePath !== undefined) data.imagePath = dto.imagePath;

    if (dto.isCompleted !== undefined && dto.isCompleted !== existing.isCompleted) {
      data.isCompleted = dto.isCompleted;
      data.completedAt = dto.isCompleted ? new Date() : null;
    }

    return this.prisma.todo.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.todo.delete({ where: { id } });
    return { ok: true };
  }

  async stats(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const startOfWeekAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);

    const [totalCount, openCount, completedCount, completedTodayCount, overdueCount, dueTodayCount] =
      await Promise.all([
        this.prisma.todo.count({ where: { userId } }),
        this.prisma.todo.count({ where: { userId, isCompleted: false } }),
        this.prisma.todo.count({ where: { userId, isCompleted: true } }),
        this.prisma.todo.count({
          where: {
            userId,
            isCompleted: true,
            completedAt: { gte: startOfToday, lt: endOfToday },
          },
        }),
        this.prisma.todo.count({
          where: {
            userId,
            isCompleted: false,
            dueDate: { lt: startOfToday },
          },
        }),
        this.prisma.todo.count({
          where: {
            userId,
            isCompleted: false,
            dueDate: { gte: startOfToday, lt: endOfToday },
          },
        }),
      ]);

    const recentTodos = await this.prisma.todo.findMany({
      where: {
        userId,
        OR: [
          { createdAt: { gte: startOfWeekAgo } },
          { completedAt: { gte: startOfWeekAgo } },
        ],
      },
      select: { createdAt: true, completedAt: true, isCompleted: true },
    });

    const weeklyActivity = this.buildWeeklyActivity(startOfWeekAgo, recentTodos);

    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      openCount,
      completedCount,
      completedTodayCount,
      overdueCount,
      dueTodayCount,
      completionRate,
      weeklyActivity,
    };
  }

  private buildWeeklyActivity(
    startOfWeekAgo: Date,
    todos: { createdAt: Date; completedAt: Date | null; isCompleted: boolean }[],
  ) {
    const days: { date: string; completed: number; created: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeekAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const next = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      const iso = day.toISOString().slice(0, 10);

      const created = todos.filter((t) => t.createdAt >= day && t.createdAt < next).length;
      const completed = todos.filter(
        (t) => t.completedAt && t.completedAt >= day && t.completedAt < next,
      ).length;

      days.push({ date: iso, created, completed });
    }
    return days;
  }
}
