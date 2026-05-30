import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CookieOptions } from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { RegisterDto } from './dto/registerDto';

import { UserEntity } from '../users/entities/user.entity';
import { UserDecorator } from '../common/decorators/user.decorator';

// ─── Cookie config ────────────────────────────────────────────────────────────

const COOKIE_BASE: CookieOptions = {
  httpOnly: true,
  secure: true, 
  sameSite: 'none',
  path: '/',
  // domain: '.yourdomain.com', // uncomment for subdomain sharing
};

const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15 min
const REFRESH_MAX_AGE = 60 * 24 * 60 * 60 * 1000; // 60 days

// ─── Controller ───────────────────────────────────────────────────────────────

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user and send OTP' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to an existing user' })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.phone);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and receive auth cookies' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.verifyOtpAndIssueTokens(dto.phone, dto.code);

    res.cookie('access_token', result.accessToken, {
      ...COOKIE_BASE,
      maxAge: ACCESS_MAX_AGE,
    });
    res.cookie('refresh_token', result.refreshToken, {
      ...COOKIE_BASE,
      maxAge: REFRESH_MAX_AGE,
    });

    return { user: result.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access and refresh tokens' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.refreshFromCookie(
      req.cookies?.refresh_token,
    );
    if (!result)
      throw new UnauthorizedException('Invalid or expired refresh token');

    res.cookie('access_token', result.accessToken, {
      ...COOKIE_BASE,
      maxAge: ACCESS_MAX_AGE,
    });
    res.cookie('refresh_token', result.refreshToken, {
      ...COOKIE_BASE,
      maxAge: REFRESH_MAX_AGE,
    });

    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear auth cookies' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', COOKIE_BASE);
    res.clearCookie('refresh_token', COOKIE_BASE);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@UserDecorator() user: UserEntity) {
    return { user };
  }
}
