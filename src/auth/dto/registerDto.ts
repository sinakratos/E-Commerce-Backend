import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

import { Role } from 'src/common/enums/Role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'sina' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '09123456789' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'sina@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass1',
    description:
      'Must be at least 8 characters, 1 uppercase, 1 lowercase, and 1 number',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  @IsEnum(Role)
  role: Role;
}
