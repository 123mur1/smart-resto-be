import { ApiExtraModels, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

@ApiExtraModels() // keep swagger aware of this model
export class QueryUserDto {
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

  @ApiPropertyOptional({
    description: "Role",
    example: "ADMIN",
    enum: ["ADMIN", "STUDENTS", "STAFF", "SUPERADMIN"],
  })
  @IsOptional()
  @IsString()
  role?: string;

  // Pagination & sorting
  @ApiPropertyOptional({ description: "Page number", example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Sort field",
    example: "createdAt",
    enum: ["createdAt", "fullName", "email", "role"],
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    description: "Sort direction",
    example: "DESC",
    enum: ["ASC", "DESC", "asc", "desc"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["ASC", "DESC", "asc", "desc"])
  order?: string;
  // Add more fields or examples as needed for a professional UI
}
