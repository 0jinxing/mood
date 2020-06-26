import { NestMiddleware, Injectable } from "@nestjs/common";
import { Response, Request } from "express";

function getToken(authorization: string) {
  return;
}

@Injectable()
class AuthMiddleWare implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const authorization = req.header("authorization");
  }
}
