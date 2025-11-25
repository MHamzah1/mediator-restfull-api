import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const token = this.authService.login(req.user.id);
    return { access_token: token };
  }
}
