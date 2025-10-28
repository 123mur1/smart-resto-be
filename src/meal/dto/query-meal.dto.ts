import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class QueryMealDto {
  @ApiPropertyOptional({
    example: "BREAKFAST",
    description: "Type of meal",
    enum: ["BREAKFAST", "LUNCH", "DINNER", "LUNCH_DINNER"],
  })
  @IsOptional()
  @IsString()
  meal_type?: string;

  @ApiPropertyOptional({
    example: "ACTIVE",
    description: "Meal status",
    enum: ["ACTIVE", "INACTIVE"],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: 9.99,
    description: "Price in local currency",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    example: "fb1309d4-01e5-45bb-a264-28becfe9b052",
    description: "ID of the user who created the meal",
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  // Pagination & sorting
  @ApiPropertyOptional({ example: 1, description: "Page number (starts at 1)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: "Items per page (max 100)",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: "created_at",
    description: "Sort field (column name)",
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    example: "DESC",
    description: "Sort direction",
    enum: ["ASC", "DESC", "asc", "desc"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["ASC", "DESC", "asc", "desc"])
  order?: string;
}
