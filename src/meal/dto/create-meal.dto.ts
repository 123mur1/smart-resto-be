import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export enum MealTypeDto {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  LUNCH_DINNER = "LUNCH_DINNER",
}

export enum MealStatusDto {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export class CreateMealDto {
  @ApiProperty({
    example: "BREAKFAST",
    description: "Type of meal",
    enum: Object.values(MealTypeDto),
  })
  @IsEnum(MealTypeDto)
  @IsNotEmpty()
  meal_type!: MealTypeDto;

  @ApiProperty({
    example: "ACTIVE",
    description: "Meal status",
    enum: Object.values(MealStatusDto),
  })
  @IsEnum(MealStatusDto)
  @IsNotEmpty()
  status!: MealStatusDto;

  @ApiProperty({ example: 9.99, description: "Price in local currency" })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}
