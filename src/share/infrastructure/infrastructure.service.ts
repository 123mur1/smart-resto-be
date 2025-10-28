import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import { MailService } from "../email/email.service";
import { otpTemplate } from "../email/emailTemp/otpTemplate";

@Injectable()
export class InfrastructureService {
  [x: string]: any;
  constructor(
    private prisma: PrismaService,
    private readonly emailService: MailService
  ) {}

  async checkRecordExists(model: keyof PrismaService, id: string) {
    const record = await (this.prisma[model] as any).findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`${String(model)} with id ${id} not found`);
    }

    return record;
  }

  async checkDuplicate(
    model: keyof PrismaService,
    fields: { property: string; value: any }[]
  ) {
    for (const field of fields) {
      const record = await (this.prisma[model] as any).findFirst({
        where: { [field.property]: field.value },
      });
      if (record) {
        throw new ConflictException(
          `${String(model)} with ${field.property} '${field.value}' already exists`
        );
      }
    }
  }

  generatePaginationMeta(
    total: number,
    page: number,
    limit: number,
    baseUrl: string
  ) {
    const totalPages = Math.ceil(total / limit);
    return {
      pagination: {
        total,
        count: Math.min(limit, total - (page - 1) * limit),
        perPage: limit,
        currentPage: page,
        totalPages,
        links: {
          first: `${baseUrl}?page=1&limit=${limit}`,
          last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
          prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
          next:
            page < totalPages
              ? `${baseUrl}?page=${page + 1}&limit=${limit}`
              : null,
        },
      },
    };
  }
  async sendOtp(email: string, message?: string) {
    try {
      // Generate a 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      // Set expiration time (e.g., 10 minutes from now)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      // Store OTP in the database
      await this.prisma.otp.create({
        data: {
          code: otpCode,
          expires_at: expiresAt,
          user_id: user.id,
        },
      });

      // Send OTP via email
      const subject = "Your OTP Code";
      const html = otpTemplate(otpCode, message);

      await this.emailService.sendMail(email, subject, html);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error sending OTP email");
    }
  }

  async resendOtp(email: string, message?: string) {
    try {
      // Generate a 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      // Set expiration time (e.g., 10 minutes from now)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      // Store OTP in the database
      await this.prisma.otp.update({
        where: { user_id: user.id },
        data: {
          code: otpCode,
          expires_at: expiresAt,
        },
      });

      // Send OTP via email
      const subject = "Your OTP Code";
      const html = otpTemplate(otpCode, message);

      await this.emailService.sendMail(email, subject, html);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error sending OTP email");
    }
  }
}
