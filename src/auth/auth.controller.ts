import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { LoginAuthDto } from "./dto/login-auth.dto";
import { RegisterAuthDto } from "./dto/register-auth.dto";
import { ResendOtpDto } from "./dto/resend-otp";
import { VerifyEmailDto } from "./dto/verify-email.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: RegisterAuthDto })
  @ApiResponse({ status: 201, description: "User registered successfully." })
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login a user" })
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({ status: 200, description: "User logged in successfully." })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post("verify-email")
  @ApiOperation({ summary: "Verify user email" })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: "Email verified successfully." })
  @ApiResponse({ status: 404, description: "User not found." })
  @ApiResponse({ status: 401, description: "Invalid or expired OTP." })
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.veryfyEmail(verifyEmailDto);
  }

  @Post("resend-otp")
  @ApiOperation({ summary: "Resend OTP to user email" })
  @ApiBody({ type: ResendOtpDto })
  @ApiResponse({ status: 200, description: "OTP resent successfully." })
  @ApiResponse({ status: 404, description: "User not found." })
  resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto.email);
  }

  @Post("forget-password")
  @ApiOperation({ summary: "Send OTP to reset password" })
  @ApiBody({ type: ResendOtpDto })
  @ApiResponse({ status: 200, description: "OTP sent successfully." })
  @ApiResponse({ status: 404, description: "User not found." })
  forgetPassword(@Body() forgetPasswordDto: ResendOtpDto) {
    return this.authService.forgetPassword(forgetPasswordDto.email);
  }
}
