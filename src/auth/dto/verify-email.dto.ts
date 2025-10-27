import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VerifyEmailDto {
  @ApiProperty({
    example: "ruyangam15@gmail.com",
    description: "Email of the user",
  })
  @IsString()
  email!: string;

  @ApiProperty({
    example: "123456",
    description: "OTP for email verification",
  })
  @IsString()
  otp!: string;
}
