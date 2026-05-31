import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { authenticator } from 'otplib';
import { Repository } from 'typeorm';

import { JwtPayload } from './jwt.strategy';

import { RegisterDto } from './dto/registerDto';

import { UserEntity } from '../users/entities/user.entity';

export type SafeUser = Omit<UserEntity, 'otpSecret'>;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    authenticator.options = { digits: 4, step: 120, window: 1 };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private sanitize(user: UserEntity): SafeUser {
    const { otpSecret: _, ...safe } = user as UserEntity & {
      otpSecret?: string;
    };
    return safe as SafeUser;
  }

  private issueAccessToken(user: UserEntity): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      username: user.username,
    };
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });
  }

  private issueRefreshToken(user: UserEntity): Promise<string> {
    return this.jwt.signAsync(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') ?? '60d',
      },
    );
  }

  private normalizePhone(raw: string): string {
    return String(raw).trim();
  }

  // ─── Registration ────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<{ status: string }> {
    const phone = this.normalizePhone(dto.phone);

    const existing = await this.users.findOne({
      where: [{ phone }, { email: dto.email }],
    });

    if (existing) {
      if (existing.phone === phone)
        throw new ConflictException('این شماره قبلاً ثبت شده است');
      if (existing.email === dto.email)
        throw new ConflictException('این ایمیل قبلاً ثبت شده است');
    }

    // Generate a fresh TOTP secret for this user
    const otpSecret = authenticator.generateSecret();

    const user = this.users.create({
      username: dto.username,
      phone,
      email: dto.email,
      otpSecret,
    });

    await this.users.save(user);

    const code = authenticator.generate(otpSecret);
    console.log(`[OTP] ${phone} → ${code}`); // replace with SMS provider

    return { status: 'success' };
  }

  // ─── Send OTP (login) ────────────────────────────────────────────────────────

  async sendOtp(phone: string): Promise<{ status: string }> {
    phone = this.normalizePhone(phone);

    // Need otpSecret — explicitly select it
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.otpSecret')
      .where('u.phone = :phone', { phone })
      .getOne();

    if (!user) throw new BadRequestException('کاربری با این شماره یافت نشد');

    if (!user.otpSecret) {
      // Shouldn't happen after register, but guard anyway
      user.otpSecret = authenticator.generateSecret();
      await this.users.save(user);
    }

    const code = authenticator.generate(user.otpSecret);
    console.log(`[OTP] ${phone} → ${code}`); // replace with SMS provider

    return { status: 'success' };
  }

  // ─── Verify OTP & issue tokens ───────────────────────────────────────────────

  async verifyOtpAndIssueTokens(
    phone: string,
    code: string,
  ): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    phone = this.normalizePhone(phone);
    code = String(code).trim();

    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.otpSecret')
      .where('u.phone = :phone', { phone })
      .getOne();

    if (!user) throw new UnauthorizedException('کاربر یافت نشد');
    if (!user.otpSecret)
      throw new UnauthorizedException('ابتدا درخواست کد ارسال کنید');

    const valid = authenticator.check(code, user.otpSecret);
    if (!valid) throw new UnauthorizedException('کد وارد شده صحیح نمی‌باشد');

    const [accessToken, refreshToken] = await Promise.all([
      this.issueAccessToken(user),
      this.issueRefreshToken(user),
    ]);

    return { user: this.sanitize(user), accessToken, refreshToken };
  }

  // ─── Refresh ─────────────────────────────────────────────────────────────────

  async refreshFromCookie(refreshToken: string | undefined): Promise<{
    user: SafeUser;
    accessToken: string;
    refreshToken: string;
  } | null> {
    if (!refreshToken) return null;

    try {
      const decoded = await this.jwt.verifyAsync<{
        sub: number;
        type: string;
      }>(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });

      if (decoded.type !== 'refresh') return null;

      const user = await this.users.findOne({ where: { id: decoded.sub } });
      if (!user) return null;

      // Rotate both tokens
      const [accessToken, newRefreshToken] = await Promise.all([
        this.issueAccessToken(user),
        this.issueRefreshToken(user),
      ]);

      return {
        user: this.sanitize(user),
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      return null;
    }
  }
}
