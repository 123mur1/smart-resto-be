import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class RegisterAuthDto {
  @ApiProperty({
    example: "John",
    description: "First name of the user",
  })
  @IsString()
  first_name!: string;

  @ApiProperty({
    example: "Doe",
    description: "Last name of the user",
  })
  @IsString()
  last_name!: string;

  @ApiProperty({
    example: "john@example.com",
    description: "Email address of the user",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: "+1234567890",
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
