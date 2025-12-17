import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { StudentService } from "./student.service";
import { TopUpBalanceDto } from "./dto/topup-balance.dto";

@ApiTags("student")
@Controller("student")
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiOperation({ summary: "Fetch student profile by userId" })
  @ApiQuery({ name: "userId", required: true })
  findByUser(@Query("userId") userId: string) {
    return this.studentService.findByUserId(userId);
  }

  @Post("topup")
  @ApiOperation({ summary: "Top up a student's meal balance" })
  @ApiBody({ type: TopUpBalanceDto })
  topUp(@Body() dto: TopUpBalanceDto) {
    return this.studentService.topUpBalance(dto);
  }
}

