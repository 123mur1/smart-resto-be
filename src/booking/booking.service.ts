import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccessStatus,
  BookingStatus,
  MealStatus,
  MealType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  TransactionType,
} from "@prisma/client";
import { randomUUID } from "crypto";

import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { PayBookingDto } from "./dto/pay-booking.dto";
import { VerifyBookingDto } from "./dto/verify-booking.dto";

const QR_EXPIRY_MINUTES = 30;

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(dto: CreateBookingDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) throw new NotFoundException("Student not found");

    return this.prisma.$transaction(
      async (tx) => {
      // Round price to 2 decimal places to match database Decimal(10,2) precision
      // Use Prisma Decimal for precise rounding
      const priceDecimal = new Prisma.Decimal(dto.price);
      const roundedPrice = priceDecimal.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      
      const booking = await tx.mealBooking.create({
        data: {
          student_id: dto.studentId,
          meal_type: dto.mealType,
          price: roundedPrice,
          scheduled_for: dto.scheduledFor,
          status: BookingStatus.PENDING_PAYMENT,
        },
      });

      const payment = await tx.payment.create({
        data: {
          student_id: dto.studentId,
          booking_id: booking.id,
          amount: roundedPrice, // Use rounded price to ensure exact amounts
          method: dto.paymentMethod 
            ? (dto.paymentMethod as PaymentMethod) 
            : PaymentMethod.MOBILE_MONEY, // Default to MOBILE_MONEY instead of CASH
          status: PaymentStatus.PENDING,
        },
      });

      return { booking, payment };
      },
      { timeout: 15000 }
    );
  }

  async payForBooking(bookingId: string, dto: PayBookingDto) {
    const qrCode = `QR-${randomUUID()}`;
    const qrExpiresAt = new Date(Date.now() + QR_EXPIRY_MINUTES * 60 * 1000);

    return this.prisma.$transaction(
      async (tx) => {
      const booking = await tx.mealBooking.findUnique({
        where: { id: bookingId },
        include: {
          payment: true,
          student: { select: { id: true, user_id: true, balance: true } },
        },
      });

      if (!booking) throw new NotFoundException("Booking not found");
      if (booking.status !== BookingStatus.PENDING_PAYMENT) {
        throw new BadRequestException("Booking already paid or processed");
      }
      if (!booking.payment) {
        throw new BadRequestException("Booking is missing payment record");
      }

      const price = new Prisma.Decimal(booking.price);
      const currentBalance = new Prisma.Decimal(booking.student.balance ?? 0);
      if (currentBalance.lt(price)) {
        throw new BadRequestException(
          "Insufficient balance. Please top up before paying for this meal.",
        );
      }
      const remainingBalance = currentBalance.minus(price);

      const payment = await tx.payment.update({
        where: { id: booking.payment!.id },
        data: {
          status: PaymentStatus.COMPLETED,
          method: dto.paymentMethod 
            ? (dto.paymentMethod as PaymentMethod)
            : booking.payment!.method ?? PaymentMethod.MOBILE_MONEY, // Use existing method or default to MOBILE_MONEY instead of CASH
          provider_ref:
            dto.providerReference || booking.payment!.provider_ref || null,
          qr_code: qrCode,
          qr_expires_at: qrExpiresAt,
        },
      });

      await tx.mealBooking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.PAID,
          qr_code: qrCode,
          qr_expires_at: qrExpiresAt,
        },
      });

      await tx.student.update({
        where: { id: booking.student_id },
        data: {
          balance: remainingBalance,
        },
      });

      await tx.transaction.create({
        data: {
          student_id: booking.student_id,
          booking_id: booking.id,
          payment_id: payment.id,
          amount: booking.price,
          transaction_type: TransactionType.DEBIT,
          balance_after: remainingBalance,
          remarks: `Payment for ${booking.meal_type}`,
        },
      });

      await tx.restaurantMetric.upsert({
        where: { id: "main" },
        create: {
          id: "main",
          totalRevenue: price,
          totalTopUps: new Prisma.Decimal(0),
        },
        update: {
          totalRevenue: { increment: price },
        },
      });

      return {
        bookingId: booking.id,
        qrCode,
        qrExpiresAt,
        paymentStatus: payment.status,
        remainingBalance: remainingBalance.toNumber(),
      };
      },
      { timeout: 15000 }
    );
  }

  async verifyBooking(dto: VerifyBookingDto) {
    const booking = await this.prisma.mealBooking.findUnique({
      where: { qr_code: dto.qrCode },
      include: {
        student: {
          select: {
            id: true,
            user_id: true,
            user: { select: { fullName: true, email: true } },
          },
        },
      },
    });
    if (!booking) throw new NotFoundException("QR code not recognized");
    if (booking.status !== BookingStatus.PAID) {
      throw new BadRequestException("QR already used or booking not paid");
    }
    if (
      booking.qr_expires_at &&
      booking.qr_expires_at.getTime() < Date.now()
    ) {
      throw new BadRequestException("QR code has expired");
    }

    return this.prisma.$transaction(
      async (tx) => {
      const updatedBooking = await tx.mealBooking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONSUMED,
        },
      });

      const meal = await tx.meal.create({
        data: {
          user_id: booking.student.user_id,
          meal_type: booking.meal_type as MealType,
          status: MealStatus.INACTIVE,
          price: booking.price,
        },
      });

      await tx.mealAccessLog.create({
        data: {
          student_id: booking.student_id,
          meal_id: meal.id,
          booking_id: booking.id,
          status: AccessStatus.VALID,
        },
      });

      await tx.transaction.create({
        data: {
          student_id: booking.student_id,
          booking_id: booking.id,
          meal_id: meal.id,
          amount: booking.price,
          transaction_type: TransactionType.CREDIT,
          remarks: `Meal served - ${booking.meal_type}`,
        },
      });

      return {
        message: "QR validated. Meal granted.",
        bookingId: updatedBooking.id,
        student: {
          id: booking.student.id,
          name: booking.student.user?.fullName,
          email: booking.student.user?.email,
        },
        meal: {
          type: booking.meal_type,
          price: booking.price,
        },
      };
      },
      { timeout: 15000 }
    );
  }

  async listBookings(studentId?: string) {
    return this.prisma.mealBooking.findMany({
      where: studentId ? { student_id: studentId } : undefined,
      orderBy: { created_at: Prisma.SortOrder.desc },
      take: 50,
      include: {
        student: {
          select: {
            id: true,
            registration_no: true,
            user: { select: { fullName: true, email: true } },
          },
        },
        payment: {
          select: {
            status: true,
          },
        },
      },
    });
  }
}

