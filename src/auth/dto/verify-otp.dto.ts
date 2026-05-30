import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '989123456789' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^989\d{9}$/, { message: 'Phone must be in format 989XXXXXXXXX' })
  phone: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'OTP must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'OTP must be numeric' })
  code: string;
}
