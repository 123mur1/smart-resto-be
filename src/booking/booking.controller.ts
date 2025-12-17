import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { PayBookingDto } from "./dto/pay-booking.dto";
import { VerifyBookingDto } from "./dto/verify-booking.dto";

@ApiTags("booking")
@Controller("booking")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: "Create a meal booking and pending payment" })
  @ApiBody({ type: CreateBookingDto })
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(dto);
  }

  @Patch(":id/pay")
  @ApiOperation({ summary: "Mark a booking as paid and issue QR code" })
  @ApiParam({ name: "id", description: "Booking ID" })
  payBooking(@Param("id") id: string, @Body() dto: PayBookingDto) {
    return this.bookingService.payForBooking(id, dto);
  }

  @Post("verify")
  @ApiOperation({ summary: "Verify QR code during meal pickup" })
  @ApiBody({ type: VerifyBookingDto })
  verify(@Body() dto: VerifyBookingDto) {
    return this.bookingService.verifyBooking(dto);
  }

  @Get()
  @ApiOperation({ summary: "List bookings for a student" })
  @ApiResponse({ status: 200 })
  list(@Query("studentId") studentId?: string) {
    return this.bookingService.listBookings(studentId);
  }
}

