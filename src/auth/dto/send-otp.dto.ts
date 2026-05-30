import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '989123456789' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^989\d{9}$/, { message: 'Phone must be in format 989XXXXXXXXX' })
  phone: string;
}
