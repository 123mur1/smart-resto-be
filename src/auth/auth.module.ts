import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { VerifyTokenService } from "./verify-token.service";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "mySecretKey",
      signOptions: { expiresIn: "1d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, VerifyTokenService],
  exports: [AuthService, VerifyTokenService, JwtModule],
})
export class AuthModule {}
