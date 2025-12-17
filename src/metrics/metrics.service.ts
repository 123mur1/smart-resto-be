import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFinanceSummary() {
    const metric = await this.prisma.restaurantMetric.findUnique({
      where: { id: "main" },
    });

    const studentBalances = await this.prisma.student.aggregate({
      _sum: { balance: true },
      _count: { id: true },
    });

    return {
      totalRevenue: Number(metric?.totalRevenue ?? 0),
      totalTopUps: Number(metric?.totalTopUps ?? 0),
      walletLiability: Number(studentBalances._sum.balance ?? 0),
      activeStudents: studentBalances._count.id,
      updatedAt: metric?.updated_at ?? null,
    };
  }
}

