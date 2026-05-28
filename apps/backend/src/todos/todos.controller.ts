import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodosDto } from './dto/query-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosService } from './todos.service';

@ApiTags('todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a todo' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTodoDto) {
    return this.todosService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List todos with filter (all/today/week/overdue/completed)' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryTodosDto) {
    return this.todosService.findAll(user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'KPIs + weekly activity for the dashboard' })
  stats(@CurrentUser() user: AuthUser) {
    return this.todosService.stats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one todo by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.todosService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTodoDto) {
    return this.todosService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.todosService.remove(user.id, id);
  }
}
