import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local'; // Ganti dari 'passport-jwt' ke 'passport-local'
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Properti ini valid untuk passport-local
    });
  }

  async validate(email: string, password: string): Promise<any> {
    return this.authService.validateUser(email, password);
  }
}
