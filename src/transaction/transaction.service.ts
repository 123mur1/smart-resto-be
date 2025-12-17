import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

import { QueryTransactionDto } from "./dto/query-transaction.dto";

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: QueryTransactionDto) {
    try {
      const where: Prisma.TransactionWhereInput = {};

      if (query?.id) {
        where.id = query.id;
      }

      if (query?.student_id) {
        where.student_id = query.student_id;
      }

      if (query?.payment_id) {
        where.payment_id = query.payment_id;
      }

      if (query?.booking_id) {
        where.booking_id = query.booking_id;
      }

      if (query?.meal_id) {
        where.meal_id = query.meal_id;
      }

      if (query?.transaction_type) {
        where.transaction_type = query.transaction_type as any;
      }

      // Date filtering
      if (query?.startDate || query?.endDate) {
        where.transaction_date = {};
        if (query.startDate) {
          where.transaction_date.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          // Add one day to include the entire end date
          const endDate = new Date(query.endDate);
          endDate.setHours(23, 59, 59, 999);
          where.transaction_date.lte = endDate;
        }
      }

      const page = Math.max(Number(query?.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(query?.limit ?? 20), 1), 100);
      const skip = (page - 1) * limit;

      // Whitelist sortable fields
      const allowedSortFields = ["transaction_date", "amount"];
      const sortField = allowedSortFields.includes(query?.sort || "")
        ? query!.sort!
        : "transaction_date";
      const sortOrder =
        (query?.order || "desc").toLowerCase() === "asc" ? "asc" : "desc";

      const [transactions, total] = await this.prisma.$transaction([
        this.prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortField]: sortOrder,
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.transaction.count({ where }),
      ]);

      return {
        transactions: transactions.map((transaction) => ({
          id: transaction.id,
          student_id: transaction.student_id,
          meal_id: transaction.meal_id,
          payment_id: transaction.payment_id,
          booking_id: transaction.booking_id,
          transaction_type: transaction.transaction_type,
          amount: Number(transaction.amount),
          balance_after: transaction.balance_after
            ? Number(transaction.balance_after)
            : null,
          transaction_date: transaction.transaction_date.toISOString(),
          remarks: transaction.remarks,
          student: transaction.student
            ? {
                id: transaction.student.id,
                user: transaction.student.user
                  ? {
                      fullName: transaction.student.user.fullName,
                      email: transaction.student.user.email,
                    }
                  : null,
              }
            : null,
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
}

