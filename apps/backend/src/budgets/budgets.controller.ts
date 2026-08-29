import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { BudgetsService } from './budgets.service';
import { SaveBudgetDto } from './dto/save-budget.dto';

@ApiTags('budgets') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgets: BudgetsService) {}
  @Get(':month') find(@CurrentUser() user: AuthUser, @Param('month') month: string) { return this.budgets.find(user.id, month); }
  @Put(':month') save(@CurrentUser() user: AuthUser, @Param('month') month: string, @Body() dto: SaveBudgetDto) { return this.budgets.save(user.id, month, dto); }
}
