import { ApiProperty } from '@nestjs/swagger';

export class WeeklyActivityPoint {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  completed!: number;

  @ApiProperty()
  created!: number;
}

export class TodoStatsDto {
  @ApiProperty()
  openCount!: number;

  @ApiProperty()
  completedCount!: number;

  @ApiProperty()
  completedTodayCount!: number;

  @ApiProperty()
  overdueCount!: number;

  @ApiProperty()
  dueTodayCount!: number;

  @ApiProperty()
  totalCount!: number;

  @ApiProperty({ description: 'Completion rate 0-100' })
  completionRate!: number;

  @ApiProperty({ type: [WeeklyActivityPoint] })
  weeklyActivity!: WeeklyActivityPoint[];
}
