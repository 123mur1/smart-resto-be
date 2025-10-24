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
import { VerifyEmailDto } from "./dto/verify-email.dto";

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

    await this.InfrastructureService.sendOtp(user.email);
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

    if (!user.isverified) {
      throw new UnauthorizedException("Email not verified");
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

  async veryfyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: verifyEmailDto.email },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.isverified) {
      return {
        status: true,
        message: "Email is already verified",
      };
    }

    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        user_id: user.user_id,
        code: verifyEmailDto.otp,
        expires_at: {
          gt: new Date(),
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException("Invalid or expired OTP");
    }

    await this.prisma.user.update({
      where: { email: verifyEmailDto.email },
      data: { isverified: true },
    });

    await this.prisma.otp.delete({
      where: { user_id: user.user_id },
    });

    return {
      status: true,
      message: "Email verified successfully",
    };
  }

  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.isverified) {
      return {
        status: true,
        message: "Email is already verified",
      };
    }

    await this.InfrastructureService.sendOtp(email);

    return {
      status: true,
      message: "OTP resent successfully",
    };
  }

  async forgetPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.InfrastructureService.sendOtp(email);

    return {
      status: true,
      message: "OTP sent successfully",
    };
  }
}
