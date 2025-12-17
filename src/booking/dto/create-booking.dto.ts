import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

import { MealType } from "@prisma/client";

export class CreateBookingDto {
  @ApiProperty({ description: "Student ID", example: "uuid" })
  @IsString()
  studentId!: string;

  @ApiProperty({
    enum: MealType,
    example: MealType.LUNCH,
    description: "Meal type to book",
  })
  @IsEnum(MealType)
  mealType!: MealType;

  @ApiProperty({ example: 6.5, description: "Price for this booking" })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    example: "2025-11-20T12:00:00.000Z",
    description: "Optional scheduled datetime",
  })
  @IsOptional()
  scheduledFor?: Date;

  @ApiPropertyOptional({
    description: "Preferred payment method",
    example: "MOBILE_MONEY",
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

