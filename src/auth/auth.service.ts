import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { PrismaService } from "src/prisma/prisma.service";
import { InfrastructureService } from "src/share/infrastructure/infrastructure.service";

import { LoginAuthDto } from "./dto/login-auth.dto";
import { RegisterAuthDto } from "./dto/register-auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly InfrastructureService: InfrastructureService
  ) {}
  async register(registerAuthDto: RegisterAuthDto) {
    await this.InfrastructureService.checkDuplicate("user", [
      { property: "phone", value: registerAuthDto.phone },
      { property: "email", value: registerAuthDto.email },
    ]);

    const hashedPassword = await bcrypt.hash(registerAuthDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...registerAuthDto,
        password: hashedPassword,
      },
    });
    return {
      status: true,
      message: "User created successfully",
      user: {
        id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginAuthDto.email },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.password) {
      throw new UnauthorizedException("Email or password is incorrect");
    }
    const isPasswordValid = await bcrypt.compare(
      loginAuthDto.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Email or password is incorrect");
    }

    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      status: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
