import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";

export class TopUpBalanceDto {
  @ApiProperty({
    description: "Student identifier",
    example: "d57f133a-c2ef-4c59-8d05-5ec7f12f9b2e",
  })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({
    description: "Amount to credit to the student's balance",
    example: 25,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({
    description: "Payment method used for this top-up",
    example: "MOBILE_MONEY",
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @ApiProperty({
    description: "Optional reference returned by the payment provider",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  providerReference?: string;

  @ApiProperty({
    description: "Optional note about the transaction",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  note?: string;
}

