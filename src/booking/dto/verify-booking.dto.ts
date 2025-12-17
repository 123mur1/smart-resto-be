import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VerifyBookingDto {
  @ApiProperty({
    description: "QR code value generated after payment",
    example: "QR-3f056b03-4f7a-4a47-8c29-f4b71fdc9a4e",
  })
  @IsString()
  qrCode!: string;
}

