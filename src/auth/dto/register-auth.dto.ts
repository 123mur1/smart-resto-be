import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class RegisterAuthDto {
  @ApiProperty({
    example: "Merci RUYANGA",
    description: "First name of the user",
  })
  @IsString()
  fullName!: string;

  @ApiProperty({
    example: "ruyangam15@gmail.com",
    description: "Email address of the user",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: "+250780905910",
    description: "Phone number of the user",
  })
  @IsString()
  phone!: string;

  @ApiProperty({
    example: "hashedpassword",
    description: "Hashed password of the user",
  })
  @IsString()
  password!: string;
}
