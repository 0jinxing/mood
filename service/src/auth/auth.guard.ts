import { Injectable, CanActivate, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate() {
    const payload = this.authService.getBearPayload();

    if (payload && payload.sub) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
