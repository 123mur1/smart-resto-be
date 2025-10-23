import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class VerifyTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async verify(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return { valid: true, payload };
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
