import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { QueryTransactionDto } from "./dto/query-transaction.dto";
import { TransactionService } from "./transaction.service";

@ApiBearerAuth()
@ApiTags("transaction")
@Controller("transaction")
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Get all transactions with pagination and filtering",
  })
  @ApiResponse({
    status: 200,
    description: "List of transactions with pagination metadata",
  })
  findAll(@Query() query: QueryTransactionDto) {
    return this.transactionService.findAll(query);
  }
}

