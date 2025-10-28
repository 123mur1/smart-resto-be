import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { VerifyTokenService } from "src/auth/verify-token.service";

import { MealController } from "./meal.controller";
import { MealService } from "./meal.service";

@Module({
  imports: [AuthModule],
  controllers: [MealController],
  providers: [MealService],
})
export class MealModule {}
