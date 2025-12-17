import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class PayBookingDto {
  @ApiPropertyOptional({
    description: "Optional payment method override",
    example: "MOBILE_MONEY",
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: "Reference returned by payment provider",
    example: "MTN-REF-93888",
  })
  @IsOptional()
  @IsString()
  providerReference?: string;
}

