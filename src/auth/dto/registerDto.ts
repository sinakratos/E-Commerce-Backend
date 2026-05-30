import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'sina' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  username: string;

  @ApiProperty({ example: '989123456789' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^989\d{9}$/, { message: 'Phone must be in format 989XXXXXXXXX' })
  phone: string;

  @ApiProperty({ example: 'sina@example.com' })
  @IsEmail()
  email: string;
}
