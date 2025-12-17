import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { QueryPaymentDto } from "./dto/query-payment.dto";
import { PaymentService } from "./payment.service";

@ApiBearerAuth()
@ApiTags("payment")
@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all payments with pagination and filtering" })
  @ApiResponse({
    status: 200,
    description: "List of payments with pagination metadata",
  })
  findAll(@Query() query: QueryPaymentDto) {
    return this.paymentService.findAll(query);
  }
}

