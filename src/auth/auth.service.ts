import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { PrismaService } from "src/prisma/prisma.service";
import { InfrastructureService } from "src/share/infrastructure/infrastructure.service";

import { LoginAuthDto } from "./dto/login-auth.dto";
import { RegisterAuthDto } from "./dto/register-auth.dto";
import { ResetPasswordDto } from "./dto/rese-password.dto";
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
    await this.InfrastructureService.checkDuplicate("student", [
      { property: "registration_no", value: registerAuthDto.registrationNo },
    ]);

    const hashedPassword = await bcrypt.hash(registerAuthDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        fullName: registerAuthDto.fullName,
        email: registerAuthDto.email,
        phone: registerAuthDto.phone,
        password: hashedPassword,
      },
    });

    await this.prisma.student.create({
      data: {
        user_id: user.id,
        registration_no: registerAuthDto.registrationNo,
        faculty: registerAuthDto.faculty,
        meal_status: "ACTIVE",
        balance: 0,
      },
    });

    // Try to send OTP email, but don't fail registration if email fails
    try {
      await this.InfrastructureService.sendOtp(
        user.email,
        "Use this OTP to verify your email."
      );
      return {
        status: true,
        message:
          "Verification OTP sent to your email, please verify your email account",
      };
    } catch (error) {
      // If email fails, still return success but with a warning message
      // OTP is already saved in DB, so user can still verify
      console.error("Registration succeeded but email sending failed:", error);
      return {
        status: true,
        message:
          "Account created successfully, but failed to send verification email. Please contact support or try resending OTP.",
        warning: "Email service may not be configured. OTP has been generated and saved.",
      };
    }
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
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      status: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
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
        user_id: user.id,
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
      where: { user_id: user.id },
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

    await this.InfrastructureService.resendOtp(
      email,
      "Use this OTP to verify your email."
    );

    return {
      status: true,
      message: "OTP resent successfully",
    };
  }

  async forgetPassword(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (!user.isverified) {
        throw new UnauthorizedException("Email not verified");
      }

      await this.InfrastructureService.sendOtp(
        email,
        "Use this OTP to reset your password."
      );

      return {
        status: true,
        message: "OTP sent successfully",
      };
    } catch (error) {
      throw new InternalServerErrorException(
        "Error sending OTP to reset password"
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: resetPasswordDto.email },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (!user.isverified) {
        throw new UnauthorizedException("Email not verified");
      }

      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

      await this.prisma.user.update({
        where: { email: resetPasswordDto.email },
        data: { password: hashedPassword },
      });

      return {
        status: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error resetting password");
    }
  }
}
