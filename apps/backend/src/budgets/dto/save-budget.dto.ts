import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';

export class SaveBudgetItemDto {
  @IsString() @IsNotEmpty() id: string;
  @IsIn(['income', 'expenses', 'meals', 'homecoming', 'pending']) section: string;
  @IsString() name: string;
  @IsInt() @Min(0) budget: number;
  @IsInt() @Min(0) actual: number;
  @IsInt() @Min(0) amount: number;
  @IsBoolean() done: boolean;
  @IsInt() @Min(0) position: number;
}

export class SaveBudgetDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveBudgetItemDto)
  items: SaveBudgetItemDto[];
}
