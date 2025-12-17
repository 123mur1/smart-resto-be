import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { MetricsService } from "./metrics.service";

@ApiTags("metrics")
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get("finance")
  @ApiOperation({ summary: "Get restaurant revenue and wallet balances" })
  getFinance() {
    return this.metricsService.getFinanceSummary();
  }
}

