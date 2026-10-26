import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { Public } from './public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    if (dto.username === 'johndoe' && dto.password === 'susiairtest') {
      const payload = { username: 'johndoe', sub: 1, name: 'John Doe' };
      const access_token = await this.jwtService.signAsync(payload, {
        secret: 'SUPER_SECRET_SUSI_AIR_KEY_2026',
        expiresIn: '1d',
      });
      return {
        access_token,
        token_type: 'Bearer',
        expires_in: 86400,
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
