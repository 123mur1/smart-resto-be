import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class QueryPaymentDto {
  @ApiPropertyOptional({
    description: "Payment ID",
    example: "uuid-string",
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({
    description: "Student ID",
    example: "uuid-string",
  })
  @IsOptional()
  @IsString()
  student_id?: string;

  @ApiPropertyOptional({
    description: "Booking ID",
    example: "uuid-string",
  })
  @IsOptional()
  @IsString()
  booking_id?: string;

  @ApiPropertyOptional({
    description: "Payment method",
    example: "CASH",
    enum: ["CASH", "MOBILE_MONEY", "CARD", "BANK_TRANSIFER"],
  })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({
    description: "Payment status",
    example: "COMPLETED",
    enum: ["PENDING", "COMPLETED", "FAILED"],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: "Start date for filtering (ISO date string)",
    example: "2024-01-01",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date for filtering (ISO date string)",
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Pagination & sorting
  @ApiPropertyOptional({ description: "Page number", example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Sort field",
    example: "payment_date",
    enum: ["payment_date", "amount", "updated_at"],
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    description: "Sort direction",
    example: "DESC",
    enum: ["ASC", "DESC", "asc", "desc"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["ASC", "DESC", "asc", "desc"])
  order?: string;
}

