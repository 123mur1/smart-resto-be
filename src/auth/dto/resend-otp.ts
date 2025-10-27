import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ResendOtpDto {
  @ApiProperty({
    example: "ruyangam15@gmail.com",
    description: "Email of the user",
  })
  @IsString()
  email!: string;
}
