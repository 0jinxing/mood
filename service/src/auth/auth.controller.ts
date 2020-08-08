import { Controller, Post, UseGuards, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { RegisterDTO } from './dto/register';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() { email, password }: LoginDTO) {
    return this.authService.sign(email, password);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  logout() {
    // TODO
    return 'logout';
  }

  @Post('register')
  @HttpCode(200)
  register(@Body() { email, password }: RegisterDTO) {
    return this.authService.register(email, password);
  }
}
