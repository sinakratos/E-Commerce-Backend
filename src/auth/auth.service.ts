import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { LoginDto } from './dto/login.dto';

import { UserEntity } from 'src/users/entities/user.entity';
import { isPasswordValid } from 'src/common/utils/isPasswordValid';
import { hashPassword } from 'src/common/utils/password.util';
import { Role } from 'src/common/enums/Role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly jwt: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { username: loginDto.username },
    });
    if (!user) throw new UnauthorizedException('Invalid username or password');

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  async register(registerDto: Partial<UserEntity>) {
    const { username, email, phone, password, role } = registerDto;
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
      role: role ?? Role.USER,
    });

    this.usersRepository.save(user);

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
}
