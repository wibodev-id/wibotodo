import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export enum TodoFilter {
  ALL = 'all',
  TODAY = 'today',
  WEEK = 'week',
  OVERDUE = 'overdue',
  COMPLETED = 'completed',
}

export class QueryTodosDto {
  @ApiProperty({ enum: TodoFilter, required: false, default: TodoFilter.ALL })
  @IsOptional()
  @IsEnum(TodoFilter)
  filter?: TodoFilter;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeCompleted?: boolean;
}
