import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginAuthDto {
  @ApiProperty({
    example: "john@example.com",
    description: "Email address of the user",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: "hashedpassword",
    description: "Hashed password of the user",
  })
  @IsString()
  password!: string;
}
