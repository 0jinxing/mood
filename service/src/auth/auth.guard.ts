import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext) {
    const token = this.getToken(context);
    console.log("token=========>", token);
    if (token) {
      const payload = this.authService.verify(token);
      console.log(payload);
      if (payload && payload.sub) {
        return true;
      }
    }
    throw new UnauthorizedException();
  }

  getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest();
  }

  getToken(context: ExecutionContext) {
    const request = this.getRequest(context);
    const authorization = request.headers.authorization ?? "";
    console.log("request.headers", request.headers);
    console.log("authorization==>", authorization);
    const [, token] = authorization.match(/bearer\s+(\S+)/) ?? [];

    if (token) {
      return token;
    }
    return null;
  }
}
