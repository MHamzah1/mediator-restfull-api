import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User Not Found');

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid Credentials');

    return user;
  }

  async login(user: any) {
    const payload: AuthJwtPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        whatsappNumber: user.whatsappNumber,
      },
    };
  }
}
