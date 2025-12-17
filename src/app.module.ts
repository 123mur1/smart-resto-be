import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { MealModule } from "./meal/meal.module";
import { PrismaModule } from "./prisma/prisma.module";
import { InfrastructureModule } from "./share/infrastructure/infrastructure.module";
import { UserModule } from "./user/user.module";
import { BookingModule } from "./booking/booking.module";
import { StudentModule } from "./student/student.module";
import { MetricsModule } from "./metrics/metrics.module";
import { PaymentModule } from "./payment/payment.module";
import { TransactionModule } from "./transaction/transaction.module";

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    InfrastructureModule,
    MealModule,
    BookingModule,
    StudentModule,
    MetricsModule,
    PaymentModule,
    TransactionModule,
  ],
})
export class AppModule {}
