import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PaymentMethod, PaymentStatus, Prisma, TransactionType } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { TopUpBalanceDto } from "./dto/topup-balance.dto";

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: { fullName: true, email: true },
        },
      },
    });

    if (!student) throw new NotFoundException("Student profile not found");
    return student;
  }

  async topUpBalance(dto: TopUpBalanceDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) throw new NotFoundException("Student not found");
    if (dto.amount <= 0) throw new BadRequestException("Amount must be positive");

    return this.prisma.$transaction(
      async (tx) => {
      const payment = await tx.payment.create({
        data: {
          student_id: student.id,
          amount: new Prisma.Decimal(dto.amount),
          method: dto.paymentMethod 
            ? (dto.paymentMethod as PaymentMethod)
            : PaymentMethod.MOBILE_MONEY, // Default to MOBILE_MONEY instead of CASH
          status: PaymentStatus.COMPLETED,
          provider_ref: dto.providerReference || null,
        },
      });

      const currentBalance = new Prisma.Decimal(student.balance ?? 0);
      const updatedBalance = currentBalance.add(payment.amount);

      await tx.student.update({
        where: { id: student.id },
        data: {
          balance: updatedBalance,
        },
      });

      await tx.transaction.create({
        data: {
          student_id: student.id,
          payment_id: payment.id,
          amount: payment.amount,
          transaction_type: TransactionType.CREDIT,
          balance_after: updatedBalance,
          remarks: dto.note || `Top-up via ${payment.method}`,
        },
      });

      await tx.restaurantMetric.upsert({
        where: { id: "main" },
        create: {
          id: "main",
          totalTopUps: payment.amount,
          totalRevenue: new Prisma.Decimal(0),
        },
        update: {
          totalTopUps: { increment: payment.amount },
        },
      });

      return {
        message: "Balance credited successfully",
        studentId: student.id,
        balance: updatedBalance.toNumber(),
      };
      },
      { timeout: 15000 }
    );
  }
}

