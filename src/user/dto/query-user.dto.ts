import { ApiExtraModels, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class QueryUserDto {
  @ApiExtraModels(QueryUserDto)
  @ApiPropertyOptional({ description: "User ID", example: "uuid-string" })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({
    description: "User email",
    example: "user@example.com",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: "Full name", example: "John Doe" })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: "Phone number", example: "+1234567890" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Role", example: "ADMIN" })
  @ApiPropertyOptional({
    description: "Role",
    example: "ADMIN",
    enum: ["ADMIN", "USER", "MANAGER", "SUPERADMIN"],
  })
  @IsOptional()
  @IsString()
  role?: string;
  // Add more fields or examples as needed for a professional UI
}
