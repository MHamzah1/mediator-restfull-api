import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UsersService } from 'src/user/user.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwtPayload';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User Not Found');

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid Credentials');

    return { id: user.id };
  }

  login(userId: any) {
    const payload: AuthJwtPayload = { sub: userId };

    return this.jwtService.sign(payload);
  }
}
