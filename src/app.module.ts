import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { MealModule } from "./meal/meal.module";
import { PrismaModule } from "./prisma/prisma.module";
import { InfrastructureModule } from "./share/infrastructure/infrastructure.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    InfrastructureModule,
    MealModule,
  ],
})
export class AppModule {}
