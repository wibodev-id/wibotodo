export interface WeeklyActivityPoint {
  date: string;
  completed: number;
  created: number;
}

export interface TodoStats {
  totalCount: number;
  openCount: number;
  completedCount: number;
  completedTodayCount: number;
  overdueCount: number;
  dueTodayCount: number;
  completionRate: number;
  weeklyActivity: WeeklyActivityPoint[];
}
