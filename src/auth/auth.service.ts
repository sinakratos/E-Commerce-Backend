import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

import { RegisterDto } from './dto/registerDto';
import { LoginDto } from './dto/login.dto';

import { UserEntity } from 'src/users/entities/user.entity';
import { isPasswordValid } from 'src/common/utils/isPasswordValid';
import { hashPassword } from 'src/common/utils/password.util';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwt: JwtService,
    private readonly mailService: MailService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { username: loginDto.username },
    });
    if (!user) throw new UnauthorizedException('Invalid username or password');

    if (!user.isEmailVerified)
      throw new UnauthorizedException('Email not verified');

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  private generateTokens(user: UserEntity) {
    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
    };

    return {
      access_token: this.jwt.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwt.sign(payload, { expiresIn: '7d' }),
    };
  }

  async register(registerDto: RegisterDto) {
    const { username, email, phone, password } = registerDto;
    if (!isPasswordValid(password)) {
      throw new InternalServerErrorException(
        'Password must be at least 8 characters long, contain uppercase, lowercase letters, and at least one number.',
      );
    }

    const existUser = await this.usersRepository.findOne({
      where: [{ username }, { email }, { phone }],
    });
    if (existUser) {
      throw new InternalServerErrorException(
        'Username, email, or phone already taken',
      );
    }

    const user = this.usersRepository.create({
      ...registerDto,
      password: await hashPassword(password),
    });

    const token = randomBytes(32).toString('hex');
    console.log(token);

    user.emailVerifyToken = token;
    user.emailVerifyTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await this.usersRepository.save(user);

    await this.mailService.sendVerificationEmail(user.email, token);

    return { message: 'User created. Check email to verify.' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findOne({
      where: { emailVerifyToken: token },
    });

    if (!user) throw new NotFoundException('Invalid token');

    if (user.emailVerifyTokenExpires < new Date())
      throw new BadRequestException('Token expired');

    user.isEmailVerified = true;
    user.emailVerifyToken = null;
    user.emailVerifyTokenExpires = null;

    await this.usersRepository.save(user);

    return { message: 'Email verified 🎉' };
  }

  async resendVerification(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) throw new NotFoundException('No user found');

    if (user.isEmailVerified) throw new BadRequestException('Already verified');

    const newToken = randomBytes(32).toString('hex');

    user.emailVerifyToken = newToken;
    user.emailVerifyTokenExpires = new Date(Date.now() + 86400000);

    await this.usersRepository.save(user);

    await this.mailService.sendVerificationEmail(email, newToken);

    return { message: 'Verification email sent again.' };
  }
}
