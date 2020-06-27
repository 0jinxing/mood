import { NestMiddleware, Injectable, ValidationPipe } from "@nestjs/common";
import { Response, Request } from "express";

@Injectable()
class AuthMiddleWare implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const authorization = req.header("authorization");
  }
}
