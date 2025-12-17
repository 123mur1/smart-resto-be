import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

import { QueryPaymentDto } from "./dto/query-payment.dto";

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: QueryPaymentDto) {
    try {
      const page = Math.max(Number(query?.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(query?.limit ?? 20), 1), 100);
      const skip = (page - 1) * limit;

      // Whitelist sortable fields to prevent SQL injection
      const allowedSortFields = ["payment_date", "amount", "updated_at"];
      const sortField = allowedSortFields.includes(query?.sort || "")
        ? query!.sort!
        : "payment_date";
      const sortOrder =
        (query?.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

      // Build WHERE conditions
      const conditions: string[] = [];
      
      if (query?.id) {
        conditions.push(`p.id = '${query.id.replace(/'/g, "''")}'`);
      }
      if (query?.student_id) {
        conditions.push(`p.student_id = '${query.student_id.replace(/'/g, "''")}'`);
      }
      if (query?.booking_id) {
        conditions.push(`p.booking_id = '${query.booking_id.replace(/'/g, "''")}'`);
      }
      if (query?.method) {
        conditions.push(`p.method = '${query.method.replace(/'/g, "''")}'`);
      }
      if (query?.status) {
        const statusUpper = query.status.toUpperCase();
        // Handle COMPLITED typo in database
        if (statusUpper === "COMPLETED") {
          conditions.push(`(p.status = 'COMPLETED' OR p.status = 'COMPLITED')`);
        } else {
          conditions.push(`p.status = '${statusUpper.replace(/'/g, "''")}'`);
        }
      }
      if (query?.startDate) {
        conditions.push(`p.payment_date >= '${new Date(query.startDate).toISOString()}'`);
      }
      if (query?.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(`p.payment_date <= '${endDate.toISOString()}'`);
      }

      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      // Use raw query to bypass enum validation for COMPLITED typo
      const rawPayments = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          p.*,
          s.id as student_id_rel,
          u.id as user_id,
          u."fullName" as user_full_name,
          u.email as user_email
        FROM "Payment" p
        LEFT JOIN "Student" s ON p.student_id = s.id
        LEFT JOIN "User" u ON s.user_id = u.id
        ${whereClause}
        ORDER BY p."${sortField}" ${sortOrder}
        LIMIT ${limit} OFFSET ${skip}
      `);

      const totalResult = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(`
        SELECT COUNT(*) as count
        FROM "Payment" p
        ${whereClause}
      `);

      const total = Number(totalResult[0]?.count || 0);

      return {
        payments: rawPayments.map((payment: any) => ({
          id: payment.id,
          student_id: payment.student_id,
          booking_id: payment.booking_id,
          amount: Number(payment.amount),
          method: payment.method,
          provider_ref: payment.provider_ref,
          payment_date: new Date(payment.payment_date).toISOString(),
          status: payment.status === "COMPLITED" ? "COMPLETED" : payment.status, // Normalize typo
          student: payment.user_id
            ? {
                id: payment.student_id_rel,
                user: {
                  fullName: payment.user_full_name,
                  email: payment.user_email,
                },
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
      console.error("Error fetching payments:", error);
      throw error;
    }
  }
}
